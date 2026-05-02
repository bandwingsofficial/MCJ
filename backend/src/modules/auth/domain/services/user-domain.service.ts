// domain/services/user-domain.service.ts

import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';

import { AccountStatus } from '../enums/account-status.enum';

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class UserDomainService {
  // 🔐 Check if user can login
  ensureCanLogin(user: User): void {
    // 🔥 use entity method (single source of truth)
    user.canLogin();
  }

  // 🔐 Validate session usability
  ensureSessionIsValid(session: Session): void {
    // 🔥 use entity method (clean + reusable)
    session.canBeUsed();
  }

  // 🔐 Validate refresh token match (extra safety layer)
  ensureRefreshTokenMatches(
    session: Session,
    incomingHash: string,
  ): void {
    if (!incomingHash) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'Refresh token is required',
      );
    }

    if (session.refreshTokenHash !== incomingHash) {
      throw new DomainError(
        ERROR_CODES.INVALID_CREDENTIALS,
        'Invalid refresh token',
        { sessionId: session.id },
      );
    }
  }

  // 🔥 NEW: password reset eligibility
  ensureCanRequestPasswordReset(user: User): void {
    if (user.status === AccountStatus.BLOCKED) {
      throw new DomainError(
        ERROR_CODES.ACCOUNT_BLOCKED,
        'Blocked users cannot reset password',
        { userId: user.id },
      );
    }
  }

  // 🔥 NEW: ensure new password is different
  ensurePasswordIsNew(
    oldHash: string,
    newHash: string,
  ): void {
    if (oldHash === newHash) {
      throw new DomainError(
        ERROR_CODES.USER_PASSWORD_INVALID,
        'New password must be different from old password',
      );
    }
  }
}