import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../common/services/email.service';
import { AuditService, AuditAction } from '../common/services/audit.service';
import { randomUUID } from 'crypto';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15; // minutes

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // Check for too many failed login attempts
    const failedAttempts = await this.auditService.getFailedLoginAttempts(
      loginDto.email,
      this.lockoutDuration,
    );

    if (failedAttempts >= this.maxLoginAttempts) {
      await this.auditService.log(
        AuditAction.ACCOUNT_LOCKED,
        undefined,
        { email: loginDto.email, attempts: failedAttempts },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException(
        `Account temporarily locked due to too many failed login attempts. Try again in ${this.lockoutDuration} minutes.`,
      );
    }

    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      // Log failed login attempt
      await this.auditService.log(
        AuditAction.FAILED_LOGIN,
        undefined,
        { email: loginDto.email },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Log successful login
    await this.auditService.log(
      AuditAction.USER_LOGIN,
      user.id,
      { email: user.email },
      ipAddress,
      userAgent,
    );

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<{ message: string; user: Partial<User> }> {
    // Generate verification token
    const verificationToken = randomUUID();
    
    const user = await this.usersService.create({
      ...registerDto,
      verificationToken,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    // Log registration
    await this.auditService.log(
      AuditAction.USER_REGISTER,
      user.id,
      { email: user.email },
      ipAddress,
      userAgent,
    );

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user: userWithoutPassword,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    // Log logout
    await this.auditService.log(
      AuditAction.USER_LOGOUT,
      userId,
      {},
      ipAddress,
      userAgent,
    );

    return { message: 'Logout successful' };
  }

  async forgotPassword(email: string, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to user
    await this.usersService.setPasswordResetToken(user.id, resetToken, resetExpires);

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    // Log password reset request
    await this.auditService.log(
      AuditAction.PASSWORD_RESET_REQUEST,
      user.id,
      { email: user.email },
      ipAddress,
      userAgent,
    );

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(token);

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password and clear reset token
    await this.usersService.updatePassword(user.id, newPassword);
    await this.usersService.clearPasswordResetToken(user.id);

    // Log password reset completion
    await this.auditService.log(
      AuditAction.PASSWORD_RESET_COMPLETE,
      user.id,
      { email: user.email },
      ipAddress,
      userAgent,
    );

    return { message: 'Password reset successful' };
  }

  async verifyEmail(token: string, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Mark email as verified
    await this.usersService.verifyEmail(user.id);

    // Log email verification
    await this.auditService.log(
      AuditAction.EMAIL_VERIFICATION,
      user.id,
      { email: user.email },
      ipAddress,
      userAgent,
    );

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = randomUUID();
    await this.usersService.updateVerificationToken(user.id, verificationToken);

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return { message: 'Verification email sent' };
  }
}