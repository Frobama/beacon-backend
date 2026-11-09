import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';

interface GrpcError {
  code?: number;
  details?: string;
  message?: string;
}

/** Traduce un error de gRPC a una excepción HTTP que GraphQL sabe mostrar. */
export function toHttpException(error: unknown): Error {
  const grpcError = (error ?? {}) as GrpcError;
  const message = grpcError.details ?? grpcError.message ?? 'Unexpected error';

  switch (grpcError.code) {
    case status.NOT_FOUND:
      return new NotFoundException(message);
    case status.INVALID_ARGUMENT:
      return new BadRequestException(message);
    case status.FAILED_PRECONDITION:
    case status.ABORTED:
      return new ConflictException(message);
    case status.UNAVAILABLE:
    case status.DEADLINE_EXCEEDED:
      return new ServiceUnavailableException('Incidents service unavailable');
    default:
      return new InternalServerErrorException('Unexpected error');
  }
}
