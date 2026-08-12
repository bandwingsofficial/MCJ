// src/common/exceptions/base.exception.ts

import { ErrorCode } from '../constants/error-codes';

export class BaseException extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);

    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}