// domain/services/user-domain.service.ts

import { User } from '../entities/user.entity';

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class UserDomainService {
  // 🔥 cross-entity / policy logic only

  ensureAdminHasMfa(user: User): void {
    if (user.isAdmin() && !user.mfaEnabled) {
      throw new DomainError(
        ERROR_CODES.ADMIN_MFA_REQUIRED,
        'Admin accounts must enable MFA',
        { userId: user.id },
      );
    }
  }
}
