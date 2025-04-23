import { Module } from '@nestjs/common';
import { CacheModule as CacheManagerModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheManagerModule.registerAsync<RedisClientOptions>({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        ttl: 60 * 60 * 24, // 24 hours default TTL
      }),
    }),
  ],
  exports: [CacheManagerModule],
})
export class CacheModule {} 