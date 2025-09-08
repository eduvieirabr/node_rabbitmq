import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Guard que permite acesso se:
 * - A estratégia JWT do Passport autenticou (request.user presente), OU
 * - O gateway injeta Authorization: Bearer supersecret-upstream-token para o upstream, OU
 * - (legado educativo) header X-Gateway-Token com valor conhecido.
 */
@Injectable()
export class KongOrJwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.user) return true;

    // Aceita Authorization injetado pelo Kong
    const authHeader: string | undefined = req.headers['authorization'];
    if (
      typeof authHeader === 'string' &&
      authHeader.toLowerCase().startsWith('bearer ') &&
      authHeader.split(' ')[1] === 'supersecret-upstream-token'
    ) {
      return true;
    }

    const gwToken: string | undefined = req.headers['x-gateway-token'];
    if (typeof gwToken === 'string' && gwToken === 'supersecret-gw') {
      return true;
    }

    throw new UnauthorizedException('Unauthorized');
  }
}