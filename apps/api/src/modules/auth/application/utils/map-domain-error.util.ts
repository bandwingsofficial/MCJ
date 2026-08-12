// application/utils/map-domain-error.util.ts

import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { UnauthorizedError } from '../errors/unauthorized.error';
import { ValidationError } from '../errors/validation.error';

const UNAUTHORIZED_CODES = new Set<string>([
  ERROR_CODES.UNAUTHORIZED,
  ERROR_CODES.INVALID_CREDENTIALS,
  ERROR_CODES.INVALID_TOKEN,
  ERROR_CODES.TOKEN_EXPIRED,
  ERROR_CODES.TOKEN_REUSE_DETECTED,
  ERROR_CODES.SESSION_NOT_FOUND,
  ERROR_CODES.SESSION_EXPIRED,
  ERROR_CODES.SESSION_REVOKED,
  ERROR_CODES.SESSION_UNAUTHORIZED,
  ERROR_CODES.ADMIN_MFA_REQUIRED,
  ERROR_CODES.ACCOUNT_BLOCKED,
  ERROR_CODES.ACCOUNT_INACTIVE,
  ERROR_CODES.USER_NOT_FOUND,
]);

export function mapDomainError(error: DomainError): never {
  if (UNAUTHORIZED_CODES.has(error.code)) {
    throw new UnauthorizedError(error.message, error.code, error.metadata);
  }

  throw new ValidationError(error.message, error.code, error.metadata);
}
