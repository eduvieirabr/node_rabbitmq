import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que aplica a estratégia 'jwt' do Passport.
 *
 * Use com @UseGuards(JwtAuthGuard) para proteger rotas com access token.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
