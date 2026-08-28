import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BranchUser } from '../entities/branch-user.entity';

export type CreateIdentityDecision =
  | { action: 'create' }
  | { action: 'restore'; user: BranchUser };

function throwActiveEmail(): never {
  throw new BaseException(
    ERROR_CODES.EMAIL_ALREADY_EXISTS,
    'An active user already exists with this email.',
    409,
    { field: 'email' },
  );
}

function throwActivePhone(): never {
  throw new BaseException(
    ERROR_CODES.PHONE_ALREADY_EXISTS,
    'An active user already exists with this phone number.',
    409,
    { field: 'phone' },
  );
}

function throwPhoneDeletedOnly(): never {
  throw new BaseException(
    ERROR_CODES.PHONE_BELONGS_TO_DELETED_USER,
    'A deleted account already exists with this phone number. Use that account’s email to restore it.',
    409,
    { field: 'phone' },
  );
}

function throwMergeConflict(): never {
  throw new BaseException(
    ERROR_CODES.IDENTITY_MERGE_CONFLICT,
    'This phone number belongs to a different deleted account. Email and phone must identify the same user.',
    409,
    { field: 'phone' },
  );
}

/**
 * Email is the primary restoration key. Phone never restores a different person.
 */
export function resolveCreateIdentity(params: {
  emailMatch: BranchUser | null;
  phoneMatch: BranchUser | null;
}): CreateIdentityDecision {
  const { emailMatch, phoneMatch } = params;

  if (emailMatch && !emailMatch.isDeleted) {
    throwActiveEmail();
  }

  if (!emailMatch && phoneMatch && !phoneMatch.isDeleted) {
    throwActivePhone();
  }

  if (!emailMatch && phoneMatch && phoneMatch.isDeleted) {
    throwPhoneDeletedOnly();
  }

  if (
    emailMatch?.isDeleted &&
    phoneMatch &&
    phoneMatch.id !== emailMatch.id &&
    !phoneMatch.isDeleted
  ) {
    throwActivePhone();
  }

  if (
    emailMatch?.isDeleted &&
    phoneMatch &&
    phoneMatch.id !== emailMatch.id &&
    phoneMatch.isDeleted
  ) {
    throwMergeConflict();
  }

  if (emailMatch?.isDeleted) {
    return { action: 'restore', user: emailMatch };
  }

  return { action: 'create' };
}
