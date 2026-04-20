import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RefreshTokenRepository {
  private readonly client: Redis;
  private readonly ttl: number = 60 * 60 * 24 * 7; // 7 dias em segundos

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.get<string>('redis.host'),
      port: this.config.get<number>('redis.port'),
      password: this.config.get<string>('redis.password'),
    });
  }

  async save(userId: string, token: string): Promise<void> {
    await this.client.set(`refresh:${userId}`, token, 'EX', this.ttl);
  }

  async find(userId: string): Promise<string | null> {
    return this.client.get(`refresh:${userId}`);
  }

  async delete(userId: string): Promise<void> {
    await this.client.del(`refresh:${userId}`);
  }
}
