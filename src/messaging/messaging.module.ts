import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        exchanges: [
          {
            name: config.get('RABBITMQ_EXCHANGE', 'app.exchange'),
            type: 'topic',
          },
        ],
        uri:
          config.get<string>('RABBITMQ_URL') ||
          `amqp://${config.get<string>('RABBITMQ_USER', 'guest')}:${config.get<string>('RABBITMQ_PASSWORD', 'guest')}@${config.get<string>('RABBITMQ_HOST', 'localhost')}:${config.get<string>('RABBITMQ_PORT', '5672')}`,
        connectionInitOptions: { wait: true, timeout: 30000 },
      }),
    }),
  ],
  exports: [RabbitMQModule],
})
export class MessagingModule {}
