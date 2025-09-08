import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { OrderEntity } from './order.entity';

/** Serviço simples para publicar eventos de novas orders via RxJS. */
@Injectable()
export class OrdersEventsService {
  private readonly subject = new Subject<OrderEntity>();

  asObservable() {
    return this.subject.asObservable();
  }

  emit(order: OrderEntity): void {
    this.subject.next(order);
  }
}

