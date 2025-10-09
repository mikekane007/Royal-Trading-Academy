import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY, key);
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL, ttl);

export const Cacheable = (key: string, ttl: number = 300) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, key)(target, propertyName, descriptor);
    SetMetadata(CACHE_TTL, ttl)(target, propertyName, descriptor);
  };
};