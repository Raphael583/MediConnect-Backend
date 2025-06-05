import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('UPSTASH_REDIS_REST_URL');
        const token = configService.get<string>('UPSTASH_REDIS_REST_TOKEN');
        if (!url || !token) {
          throw new Error('Missing Redis configuration in .env');
        }
        return new Redis({ url, token });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
