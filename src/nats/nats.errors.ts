import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

export class NatsRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'NatsRequestError';
  }
}

export function natsToHttpException(error: unknown): Error {
  if (!(error instanceof NatsRequestError)) {
    return new ServiceUnavailableException('Notifications service unavailable');
  }
  if (error.code === 'NOT_FOUND') return new NotFoundException(error.message);
  if (error.code === 'INVALID_ARGUMENT') return new BadRequestException(error.message);
  return new InternalServerErrorException('Unexpected error');
}
