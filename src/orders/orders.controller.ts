import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Sse,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RabbitService } from '../rabbit/rabbit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { OrdersEventsService } from './orders.events';
import { OrderEntity } from './order.entity';
import { Observable, map } from 'rxjs';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly rabbitService: RabbitService,
    private readonly ordersEvents: OrdersEventsService,
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

  /**
   * Stream SSE com eventos de novas orders.
   */
  @Sse('stream')
  @UseGuards(JwtAuthGuard)
  stream(): Observable<MessageEvent> {
    return this.ordersEvents.asObservable().pipe(
      map((order) => ({ data: { id: order.id, createdAt: order.createdAt } } as MessageEvent)),
    );
  }

  /**
   * Lista orders criadas após uma data/hora (ISO). Ex.: /orders/new?since=2025-09-07T22:00:00Z
   */
  @Get('new')
  @UseGuards(JwtAuthGuard)
  async listNew(@Query('since') since: string): Promise<OrderEntity[]> {
    const sinceDate = since ? new Date(since) : new Date(0);
    return this.ordersService.findNewSince(sinceDate);
  }
}
