import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersConsumer } from './orders.consumer';
import { RabbitModule } from '../rabbit/rabbit.module';
import { RedisModule } from '../cache/redis.module';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { OrdersEventsService } from './orders.events';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), RabbitModule, RedisModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersConsumer, IdempotencyInterceptor, OrdersEventsService],
  exports: [OrdersService],
})
export class OrdersModule {}
