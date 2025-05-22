import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('UPSTASH_REDIS_REST_URL');
        const redisToken = configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

        if (!redisUrl || !redisToken) {
          throw new Error('Missing Redis configuration in .env');
        }

        return new Redis(redisUrl, {
          password: redisToken,
          tls: {}, // Upstash requires TLS
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
