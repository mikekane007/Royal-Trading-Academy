import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/services/email.service';
import { AuditService } from '../common/services/audit.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockRequest = {
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      } as any;

      mockAuthService.login.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      await controller.login(loginDto, mockRequest);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );
    });
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockRequest = {
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      } as any;

      mockAuthService.register.mockResolvedValue({
        message: 'Registration successful',
        user: { id: '1', email: 'test@example.com' },
      });

      await controller.register(registerDto, mockRequest);

      expect(authService.register).toHaveBeenCalledWith(
        registerDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );
    });
  });
});