// redis.provider.ts
import { Redis } from '@upstash/redis';

export const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  },
};
