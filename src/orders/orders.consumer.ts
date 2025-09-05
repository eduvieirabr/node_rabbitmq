import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersConsumer {
  private readonly logger = new Logger(OrdersConsumer.name);

  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Consumes order-created events from RabbitMQ and persists the order.
   */
  @RabbitSubscribe({
    exchange: process.env.RABBITMQ_EXCHANGE || 'app.exchange',
    routingKey: process.env.RABBITMQ_ROUTING_KEY || 'app.route',
    queue: process.env.RABBITMQ_QUEUE || 'app.queue',
  })
  async handle(payload: unknown): Promise<void> {
    this.logger.log(`Mensagem recebida: ${JSON.stringify(payload)}`);
    if (isOrderCreatedEvent(payload)) {
      await this.ordersService.create(payload.data);
      this.logger.log('Pedido salvo no PostgreSQL');
    }
  }
}

function isOrderCreatedEvent(
  value: unknown,
): value is { type: 'order.created'; data: CreateOrderDto } {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { type?: unknown; data?: unknown };
  return (
    candidate.type === 'order.created' &&
    typeof candidate.data === 'object' &&
    candidate.data !== null
  );
}
