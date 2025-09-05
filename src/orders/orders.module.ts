import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersConsumer } from './orders.consumer';
import { RabbitModule } from '../rabbit/rabbit.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), RabbitModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersConsumer],
  exports: [OrdersService],
})
export class OrdersModule {}

