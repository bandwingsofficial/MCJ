import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(
    code: string,
    message = 'Resource not found',
    metadata?: Record<string, unknown>,
  ) {
    super(code as any, message, 404, metadata);
  }
}