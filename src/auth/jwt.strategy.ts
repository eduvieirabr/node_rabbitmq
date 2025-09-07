import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Estratégia JWT usada pelo Passport para validar o access token.
 *
 * - Extrai o token do header Authorization: Bearer <token>
 * - Valida assinatura/expiração com o segredo de access token
 * - Retorna um objeto que será anexado a request.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'access-secret',
    });
  }

  async validate(payload: any) {
    // Este valor será injetado em request.user nos handlers protegidos
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
