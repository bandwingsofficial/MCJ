import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BranchUser } from '../entities/branch-user.entity';
import { BranchUserRole } from '../enums/branch-user-role.enum';
import { canBranchManagerCreateRole } from '../role-permissions';
import { BranchUserDomainService } from './branch-user-domain.service';

describe('BranchUser uniqueness and role assignment', () => {
  const domain = new BranchUserDomainService();

  it('throws EMAIL_ALREADY_EXISTS as 409 with field meta', () => {
    expect.assertions(4);

    try {
      domain.ensureDoesNotExist({} as BranchUser, 'email');
    } catch (error) {
      expect(error).toBeInstanceOf(BaseException);
      const exception = error as BaseException;
      expect(exception.code).toBe(ERROR_CODES.EMAIL_ALREADY_EXISTS);
      expect(exception.statusCode).toBe(409);
      expect(exception.metadata).toEqual({ field: 'email' });
    }
  });

  it('allows creation when the email is unused', () => {
    expect(() => domain.ensureDoesNotExist(null, 'email')).not.toThrow();
  });

  it('uses the active-email message for live duplicates', () => {
    const live = { isDeleted: false } as BranchUser;
    expect(() => domain.ensureDoesNotExist(live, 'email')).toThrow(
      expect.objectContaining({
        message: 'An active user already exists with this email.',
      }),
    );
  });

  it('only lets a branch manager create Faculty or Interviewer', () => {
    expect(canBranchManagerCreateRole(BranchUserRole.FACULTY)).toBe(true);
    expect(canBranchManagerCreateRole(BranchUserRole.INTERVIEWER)).toBe(true);
    expect(canBranchManagerCreateRole(BranchUserRole.BRANCH_MANAGER)).toBe(
      false,
    );
    expect(canBranchManagerCreateRole('SUPER_ADMIN')).toBe(false);
  });
});
