import { Controller, Get, Query } from '@nestjs/common';
import { RabbitService } from './rabbit.service';

/**
 * Controller para teste manual rápido de publicação no RabbitMQ.
 */
@Controller('rabbit')
export class RabbitController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Get('publish')
  async publish(
    @Query('msg') msg = 'hello world',
  ): Promise<{ status: string }> {
    await this.rabbitService.publishMessage({
      msg,
      at: new Date().toISOString(),
    });
    return { status: 'published' };
  }
}
