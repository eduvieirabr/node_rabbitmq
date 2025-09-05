import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersConsumer {
  private readonly logger = new Logger(OrdersConsumer.name);

  constructor(private readonly ordersService: OrdersService) {}

  @RabbitSubscribe({
    exchange: process.env.RABBITMQ_EXCHANGE || 'app.exchange',
    routingKey: process.env.RABBITMQ_ROUTING_KEY || 'app.route',
    queue: process.env.RABBITMQ_QUEUE || 'app.queue',
  })
  async handle(payload: { type?: string; data?: CreateOrderDto } | unknown): Promise<void> {
    this.logger.log(`Mensagem recebida: ${JSON.stringify(payload)}`);
    const maybeOrder = payload as { type?: string; data?: CreateOrderDto };
    if (maybeOrder?.type === 'order.created' && maybeOrder.data) {
      await this.ordersService.create(maybeOrder.data);
      this.logger.log('Pedido salvo no PostgreSQL');
    }
  }
}

