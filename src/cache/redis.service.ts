import IORedis, { Redis } from 'ioredis';

export type RedisConnectionOptions = {
  host: string;
  port: number;
};

export class RedisService {
  private readonly client: Redis;

  constructor(options: RedisConnectionOptions) {
    this.client = new IORedis({ host: options.host, port: options.port });
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
    if (ttlSeconds && ttlSeconds > 0) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}

