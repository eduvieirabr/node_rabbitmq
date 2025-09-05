import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller básico expondo um endpoint estilo health-check.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Retorna uma saudação simples.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
