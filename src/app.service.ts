import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Retorna uma string de saudação usada no endpoint raiz.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
