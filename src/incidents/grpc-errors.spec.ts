import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { toHttpException } from './grpc-errors';

describe('toHttpException', () => {
  it.each([
    [status.NOT_FOUND, NotFoundException],
    [status.INVALID_ARGUMENT, BadRequestException],
    [status.FAILED_PRECONDITION, ConflictException],
    [status.ABORTED, ConflictException],
    [status.UNAVAILABLE, ServiceUnavailableException],
    [status.DEADLINE_EXCEEDED, ServiceUnavailableException],
    [status.INTERNAL, InternalServerErrorException],
  ])('maps gRPC code %s', (code, expected) => {
    expect(toHttpException({ code, details: 'boom' })).toBeInstanceOf(expected);
  });

  it('keeps the details message for client errors', () => {
    const error = toHttpException({ code: status.NOT_FOUND, details: 'Incident not found' });
    expect(error.message).toBe('Incident not found');
  });

  it('handles non-gRPC errors', () => {
    expect(toHttpException(new Error('x'))).toBeInstanceOf(InternalServerErrorException);
    expect(toHttpException(undefined)).toBeInstanceOf(InternalServerErrorException);
  });
});
