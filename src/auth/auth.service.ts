import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { RedisService } from '../cache/redis.service';

/**
 * Estrutura de usuário utilizada para MOCK neste exemplo.
 * Em produção, você buscaria estes dados em uma API .NET/DB.
 */
type MockUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

@Injectable()
export class AuthService {
  /**
   * Banco de dados em memória (apenas para fins de demonstração).
   * NUNCA armazene senhas em texto puro na vida real.
   */
  private readonly users: Array<MockUser & { password: string }> = [
    {
      id: '1',
      email: 'dev@example.com',
      name: 'Dev User',
      roles: ['user'],
      password: 'dev123',
    },
    {
      id: '2',
      email: 'admin@example.com',
      name: 'Admin User',
      roles: ['admin'],
      password: 'admin123',
    },
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Valida credenciais do usuário.
   *
   * - No mundo real, aqui você chamaria a API .NET de usuários
   *   para validar email/senha e retornar os dados do usuário.
   */
  async validateUser(email: string, password: string): Promise<MockUser> {
    const found = this.users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!found) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _pw, ...user } = found;
    return user;
  }

  /**
   * Gera par de tokens (access e refresh) para o usuário autenticado.
   *
   * - Access token: curto prazo, usado no header Authorization (Bearer)
   * - Refresh token: longo prazo, usado para obter novos access tokens
   */
  async login(
    user: MockUser,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Emissor alinhado ao Kong (consumer key_claim_name=iss)
    const issuer = 'authservice';

    // Access Token (validado por Kong e pelo BFF)
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      roles: user.roles,
      iss: issuer,
      typ: 'access',
    });

    // Refresh Token com JTI para controle no Redis
    const jti = randomUUID();
    const refreshExpires = process.env.JWT_REFRESH_EXPIRES || '7d';
    const refreshTtlSeconds = parseDurationToSeconds(refreshExpires);
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        iss: issuer,
        typ: 'refresh',
        jti,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: refreshExpires,
      },
    );

    // Armazena o JTI no Redis para validar em futuras renovações
    await this.redis.set(`auth:rt:${user.id}:${jti}`, '1', refreshTtlSeconds);

    return { accessToken, refreshToken };
  }

  /**
   * Valida o refresh token e emite um novo par access/refresh.
   *
   * Observação: Em produção, armazene o refresh token (ou seu hash)
   * no servidor/Redis e invalide quando o usuário fizer logout.
   */
  async refresh(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });
      if (payload?.typ !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verifica existência do JTI no Redis (token não revogado/expirado no cache)
      const jti: string | undefined = payload?.jti;
      const sub: string | undefined = payload?.sub;
      if (!jti || !sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const exists = await this.redis.get(`auth:rt:${sub}:${jti}`);
      if (!exists) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Rotação de refresh token: invalida o antigo JTI
      await this.redis.del(`auth:rt:${sub}:${jti}`);

      // Reemite novo par de tokens
      const user = this.users.find((u) => u.id === sub);
      if (!user) throw new UnauthorizedException('User not found');
      const { password: _pw, ...publicUser } = user;
      return this.login(publicUser);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

// Utilitário simples para converter durações em segundos (suporta s, m, h, d)
function parseDurationToSeconds(input: string): number {
  const match = String(input).trim().match(/^(\d+)([smhd]?)$/i);
  if (!match) return 7 * 24 * 60 * 60; // default 7d
  const value = parseInt(match[1], 10);
  const unit = match[2]?.toLowerCase() || 's';
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return value;
  }
}
