import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'password'),
  database: configService.get('DB_NAME', 'royal_trading_academy'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') !== 'production',
  logging: configService.get('NODE_ENV') === 'development',
  
  // Connection Pool Configuration
  extra: {
    connectionLimit: configService.get('DB_CONNECTION_LIMIT', 10),
    acquireTimeout: configService.get('DB_ACQUIRE_TIMEOUT', 60000),
    timeout: configService.get('DB_TIMEOUT', 60000),
    
    // Performance optimizations
    statement_timeout: '30s',
    query_timeout: '30s',
    
    // Connection pool settings
    max: configService.get('DB_POOL_MAX', 20),
    min: configService.get('DB_POOL_MIN', 5),
    idle: configService.get('DB_POOL_IDLE', 10000),
    
    // SSL configuration for production
    ssl: configService.get('NODE_ENV') === 'production' ? {
      rejectUnauthorized: false
    } : false,
  },
  
  // Query optimization
  cache: {
    duration: 30000, // 30 seconds
    type: 'redis',
    options: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
    },
  },
});