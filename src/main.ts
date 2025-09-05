import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * Inicializa a aplicação Nest.
 *
 * - Cria a aplicação usando o AppModule raiz
 * - Habilita um ValidationPipe global para validar e transformar DTOs
 * - Sobe na porta definida pela variável de ambiente PORT (padrão 3000)
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
