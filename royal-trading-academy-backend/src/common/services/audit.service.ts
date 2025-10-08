import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export enum AuditAction {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  FAILED_LOGIN = 'FAILED_LOGIN',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    action: AuditAction,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        action,
        userId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      await this.auditLogRepository.save(auditLog);
      
      this.logger.log(`Audit log created: ${action} for user ${userId || 'anonymous'}`);
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  async getAuditLogs(
    userId?: string,
    action?: AuditAction,
    limit: number = 100,
    offset: number = 0,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (userId) {
      query.andWhere('audit.userId = :userId', { userId });
    }

    if (action) {
      query.andWhere('audit.action = :action', { action });
    }

    return query
      .orderBy('audit.timestamp', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  async getFailedLoginAttempts(
    email: string,
    timeWindow: number = 15, // minutes
  ): Promise<number> {
    const since = new Date(Date.now() - timeWindow * 60 * 1000);
    
    const count = await this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.action = :action', { action: AuditAction.FAILED_LOGIN })
      .andWhere('audit.details LIKE :email', { email: `%${email}%` })
      .andWhere('audit.timestamp >= :since', { since })
      .getCount();

    return count;
  }
}