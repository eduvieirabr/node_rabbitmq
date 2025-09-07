import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { createHash } from 'crypto';
import { RedisService } from '../cache/redis.service';

/**
 * Interceptor de idempotência para o endpoint de criação de pedidos.
 *
 * - Gera uma chave a partir do corpo da requisição (hash) e guarda no Redis por um curto período
 * - Se a mesma requisição for recebida novamente dentro do TTL, evita duplicidade
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly ttlSeconds = 60;

  constructor(private readonly redis: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const bodyString = JSON.stringify(req.body ?? {});
    const hash = createHash('sha256').update(bodyString).digest('hex');
    const key = `orders:req:${hash}`;

    const exists = await this.redis.get(key);
    if (exists) {
      // Já processado recentemente; retorna uma resposta padrão
      return of({ status: 'queued' });
    }

    await this.redis.set(key, '1', this.ttlSeconds);

    return next.handle().pipe(
      map((value) => value),
    );
  }
}

