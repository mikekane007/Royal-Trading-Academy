import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CACHE_KEY, CACHE_TTL } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(CACHE_KEY, context.getHandler());
    const cacheTTL = this.reflector.get<number>(CACHE_TTL, context.getHandler());

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const fullCacheKey = this.generateCacheKey(cacheKey, request);

    try {
      const cachedResult = await this.cacheManager.get(fullCacheKey);
      if (cachedResult) {
        return of(cachedResult);
      }

      return next.handle().pipe(
        tap(async (result) => {
          if (result) {
            await this.cacheManager.set(fullCacheKey, result, cacheTTL || 300);
          }
        }),
      );
    } catch (error) {
      // If cache fails, continue without caching
      return next.handle();
    }
  }

  private generateCacheKey(baseKey: string, request: any): string {
    const userId = request.user?.id || 'anonymous';
    const queryParams = JSON.stringify(request.query || {});
    return `${baseKey}:${userId}:${Buffer.from(queryParams).toString('base64')}`;
  }
}