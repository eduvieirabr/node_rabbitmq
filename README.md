<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Environment

Copie `.env.example` para `.env` e ajuste conforme necessário. Ao usar Docker, as variáveis já estão definidas no `docker-compose.yml`.

```bash
cp .env.example .env
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Docker

Suba a aplicação, PostgreSQL e RabbitMQ com:

```bash
docker compose up --build
```

RabbitMQ Management UI: http://localhost:15672 (guest/guest)

Teste de publicação de mensagem:

```bash
curl "http://localhost:3000/rabbit/publish?msg=hello"
```

## Auth (JWT)

Exemplo simples de autenticação com JWT (usuários mock) para proteger o BFF.

- Usuários de exemplo:
  - dev@example.com / dev123 (role: user)
  - admin@example.com / admin123 (role: admin)

- Variáveis opcionais (defaults):
  - `JWT_ACCESS_SECRET` (default `access-secret`)
  - `JWT_ACCESS_EXPIRES` (default `15m`)
  - `JWT_REFRESH_SECRET` (default `refresh-secret`)
  - `JWT_REFRESH_EXPIRES` (default `7d`)

Login (gera accessToken e refreshToken):

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "dev123"
  }'
```

Usar o access token para acessar rota protegida (`POST /orders`):

```bash
ACCESS_TOKEN="<cole_o_accessToken_aqui>"

curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "items": [
      { "sku": "SKU-1", "quantity": 2, "price": 10.5 },
      { "sku": "SKU-2", "quantity": 1, "price": 5 }
    ],
    "total": 26
  }'
```

Refresh do token (gera novo par access/refresh):

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<cole_o_refreshToken_aqui>"
  }'
```

## Run tests

## Kong (API Gateway) + Redis (cache)

Este projeto inclui Kong (DB-less) como gateway e Redis para cache/controle de tokens.

- Kong
  - Proxy: `http://localhost:8000`
  - Admin: `http://localhost:8001`
  - Configuração: `kong/kong.yml`
  - Plugin JWT habilitado na rota do BFF; consumer `authservice` (HS256, `secret: supersecret`).
  - O token precisa conter `iss=authservice` e será validado pelo Kong antes de chegar à API.

- Redis
  - Usado para: cache de refresh token (`jti`) e idempotência em `POST /orders`.

### Subir o stack com gateway e cache

```bash
docker compose up -d --build
```

### Fluxo via Kong

1) Obter tokens no BFF (local, porta 3000):

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "dev@example.com", "password": "dev123" }'
```

2) Chamar a API protegida via Kong (porta 8000):

```bash
ACCESS_TOKEN="<cole_o_accessToken_aqui>"

curl -X POST http://localhost:8000/orders \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "items": [
      { "sku": "SKU-1", "quantity": 2, "price": 10.5 },
      { "sku": "SKU-2", "quantity": 1, "price": 5 }
    ],
    "total": 26
  }'
```

3) Renovar tokens (direto no BFF):

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "<cole_o_refreshToken_aqui>" }'
```

Notas:
- O Kong rejeita tokens inválidos/expirados antes de chegar no BFF (defense-in-depth).
- `JWT_ACCESS_SECRET` está definido no compose como `supersecret`, alinhado com o `kong.yml`.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
