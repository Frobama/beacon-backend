import { BadRequestException, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { NatsRequestError, natsToHttpException } from './nats.errors.js';
import { NatsService } from './nats.service.js';

describe('NATS', () => {
  it.each([
    ['NOT_FOUND', NotFoundException],
    ['INVALID_ARGUMENT', BadRequestException],
    ['INTERNAL', InternalServerErrorException],
  ])('maps %s', (code, expected) => expect(natsToHttpException(new NatsRequestError(code, 'bad'))).toBeInstanceOf(expected));
  it('maps transport failures', () => expect(natsToHttpException(new Error('down'))).toBeInstanceOf(ServiceUnavailableException));
  it('requests JSON and handles headers and empty payloads', async () => {
    const service = new NatsService();
    const request = jest.fn().mockResolvedValue({ string: () => '', headers: undefined });
    (service as unknown as { connection: unknown }).connection = { request, drain: jest.fn() };
    await expect(service.request('subject', { x: 1 })).resolves.toEqual({});
    expect(request).toHaveBeenCalledWith('subject', '{"x":1}', { timeout: 3000 });
  });
  it('throws an error from response headers and drains', async () => {
    const drain = jest.fn().mockResolvedValue(undefined);
    const service = new NatsService();
    (service as unknown as { connection: unknown }).connection = { drain, request: jest.fn().mockResolvedValue({ string: () => '', headers: { get: (name: string) => name.includes('Code') ? 'NOT_FOUND' : 'missing' } }) };
    await expect(service.request('subject')).rejects.toMatchObject({ code: 'NOT_FOUND', message: 'missing' });
    await service.onModuleDestroy();
    expect(drain).toHaveBeenCalled();
  });
  it('rejects before connection and connects on init', async () => {
    const service = new NatsService();
    await expect(service.request('subject')).rejects.toThrow('not ready');
  });
});
