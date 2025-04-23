import { Module } from '@nestjs/common';
import { CacheModule as CacheManagerModule } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheManagerModule.registerAsync<RedisClientOptions>({
      useFactory: () => ({
        store: 'redis',
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        ttl: 60 * 60 * 24, // 24 hours default TTL
      }),
    }),
  ],
  exports: [CacheManagerModule],
})
export class CacheModule {} 