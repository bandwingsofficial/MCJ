import { ERROR_CODES } from '../../domain/errors/error-codes';
import { DomainError } from '../../domain/errors/domain.error';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { ValidationError } from '../errors/validation.error';
import { mapDomainError } from './map-domain-error.util';

describe('mapDomainError', () => {
  it('maps session/auth domain errors to UnauthorizedError', () => {
    expect(() =>
      mapDomainError(
        new DomainError(ERROR_CODES.SESSION_REVOKED, 'Session is revoked'),
      ),
    ).toThrow(UnauthorizedError);
  });

  it('maps other domain errors to ValidationError', () => {
    expect(() =>
      mapDomainError(
        new DomainError(ERROR_CODES.USER_PASSWORD_INVALID, 'bad password'),
      ),
    ).toThrow(ValidationError);
  });
});
