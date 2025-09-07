import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RabbitService } from '../rabbit/rabbit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdempotencyInterceptor } from './idempotency.interceptor';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly rabbitService: RabbitService,
  ) {}

  /**
   * Recebe um payload de pedido, valida e publica um evento no RabbitMQ.
   *
   * A persistência acontece no OrdersConsumer ao consumir a mensagem.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(IdempotencyInterceptor)
  async create(@Body() body: CreateOrderDto): Promise<{ status: string }> {
    await this.rabbitService.publishMessage({
      type: 'order.created',
      data: body,
    });
    return { status: 'queued' };
  }
}
