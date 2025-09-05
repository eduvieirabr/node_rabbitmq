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
          config.get('RABBITMQ_URL') ||
          `amqp://${config.get('RABBITMQ_USER', 'guest')}:${config.get('RABBITMQ_PASSWORD', 'guest')}@${config.get('RABBITMQ_HOST', 'localhost')}:${config.get('RABBITMQ_PORT', '5672')}`,
        connectionInitOptions: { wait: true, timeout: 30000 },
      }),
    }),
  ],
  exports: [RabbitMQModule],
})
export class MessagingModule {}

