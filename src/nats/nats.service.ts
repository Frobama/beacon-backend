import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, type NatsConnection } from '@nats-io/transport-node';
import { NatsRequestError } from './nats.errors.js';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private connection?: NatsConnection;

  async onModuleInit(): Promise<void> {
    this.connection = await connect({
      servers: process.env.NATS_URL ?? 'nats://localhost:4222',
      name: 'beacon-backend',
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.connection?.drain();
  }

  async request<T>(subject: string, payload: unknown = {}, timeoutMs = 3000): Promise<T> {
    if (!this.connection) throw new Error('NATS connection is not ready');
    const reply = await this.connection.request(subject, JSON.stringify(payload), { timeout: timeoutMs });
    const code = reply.headers?.get('Beacon-Error-Code') ?? '';
    if (code) {
      throw new NatsRequestError(code, reply.headers?.get('Beacon-Error-Message') ?? 'NATS request failed');
    }
    const body = reply.string();
    return (body ? JSON.parse(body) : {}) as T;
  }
}
