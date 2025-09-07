import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RedisService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = parseInt(config.get<string>('REDIS_PORT', '6379'), 10);
        return new RedisService({ host, port });
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}

