import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitService {
  private readonly logger = new Logger(RabbitService.name);
  private readonly exchangeName: string;
  private readonly routingKey: string;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
  ) {
    this.exchangeName = this.configService.get('RABBITMQ_EXCHANGE', 'app.exchange');
    this.routingKey = this.configService.get('RABBITMQ_ROUTING_KEY', 'app.route');
  }

  async publishMessage(message: unknown): Promise<void> {
    await this.amqpConnection.publish(this.exchangeName, this.routingKey, message);
  }

  // Este serviço apenas publica mensagens; o consumo foi movido para OrdersConsumer
}

