import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DatabaseOptimizationService {
  private readonly logger = new Logger(DatabaseOptimizationService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async optimizeDatabase() {
    this.logger.log('Starting database optimization...');
    
    try {
      // Analyze tables for better query planning
      await this.analyzeAllTables();
      
      // Clean up old audit logs (older than 90 days)
      await this.cleanupOldAuditLogs();
      
      // Update statistics
      await this.updateTableStatistics();
      
      this.logger.log('Database optimization completed successfully');
    } catch (error) {
      this.logger.error('Database optimization failed:', error);
    }
  }

  private async analyzeAllTables() {
    const tables = [
      'users', 'courses', 'lessons', 'enrollments', 
      'progress', 'forum_categories', 'forum_threads', 
      'forum_posts', 'payments', 'audit_logs'
    ];

    for (const table of tables) {
      try {
        await this.dataSource.query(`ANALYZE ${table}`);
        this.logger.debug(`Analyzed table: ${table}`);
      } catch (error) {
        this.logger.warn(`Failed to analyze table ${table}:`, error.message);
      }
    }
  }

  private async cleanupOldAuditLogs() {
    const result = await this.dataSource.query(`
      DELETE FROM audit_logs 
      WHERE created_at < NOW() - INTERVAL '90 days'
    `);
    
    this.logger.log(`Cleaned up ${result.affectedRows || 0} old audit log entries`);
  }

  private async updateTableStatistics() {
    await this.dataSource.query('VACUUM ANALYZE');
    this.logger.debug('Updated table statistics');
  }

  async getSlowQueries(limit: number = 10) {
    return this.dataSource.query(`
      SELECT query, calls, total_time, mean_time, rows
      FROM pg_stat_statements
      ORDER BY total_time DESC
      LIMIT $1
    `, [limit]);
  }

  async getDatabaseSize() {
    const result = await this.dataSource.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    return result[0]?.size;
  }

  async getTableSizes() {
    return this.dataSource.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY size_bytes DESC
    `);
  }
}