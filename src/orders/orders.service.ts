import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async create(createDto: CreateOrderDto): Promise<OrderEntity> {
    const entity: OrderEntity = this.orderRepository.create({
      customerName: createDto.customerName,
      customerEmail: createDto.customerEmail,
      items: createDto.items,
      total: String(createDto.total),
    });
    return this.orderRepository.save(entity);
  }
}

