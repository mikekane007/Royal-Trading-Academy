import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import { FileUploadService } from './services/file-upload.service';
import { SimpleCacheService } from './services/simple-cache.service';
import { DatabaseOptimizationService } from './services/database-optimization.service';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    ConfigModule,
  ],
  providers: [EmailService, AuditService, FileUploadService, SimpleCacheService, DatabaseOptimizationService],
  exports: [EmailService, AuditService, FileUploadService, SimpleCacheService, DatabaseOptimizationService],
})
export class CommonModule {}