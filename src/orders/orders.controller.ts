import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RabbitService } from '../rabbit/rabbit.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly rabbitService: RabbitService,
  ) {}

  @Post()
  async create(@Body() body: CreateOrderDto): Promise<{ status: string }> {
    await this.rabbitService.publishMessage({ type: 'order.created', data: body });
    return { status: 'queued' };
  }
}

