import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import { FileUploadService } from './services/file-upload.service';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    ConfigModule,
  ],
  providers: [EmailService, AuditService, FileUploadService],
  exports: [EmailService, AuditService, FileUploadService],
})
export class CommonModule {}