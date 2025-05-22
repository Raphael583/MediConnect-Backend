import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis({
      url: 'https://golden-halibut-38616.upstash.io',
      token: 'AZbYAAIjcDFkM2RjYWMyYzk1MjE0YjdjYTFkNjE3YmM1NDQ2MmQzMXAxMA',
    });
  }

  async set(key: string, value: string) {
    return await this.redis.set(key, value);
  }

  async get(key: string) {
    return await this.redis.get(key);
  }

  async onModuleDestroy() {
    // Upstash Redis doesn't require explicit disconnect,
    // but if you want to clean up resources, add it here.
  }
}
