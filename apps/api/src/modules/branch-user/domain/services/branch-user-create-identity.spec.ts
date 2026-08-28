import { ERROR_CODES } from '@common/constants/error-codes';

import { BranchUser } from '../entities/branch-user.entity';
import { BranchUserRole } from '../enums/branch-user-role.enum';
import { resolveCreateIdentity } from './branch-user-create-identity';

function user(params: {
  id: string;
  email: string;
  phone?: string | null;
  isDeleted: boolean;
  isActive?: boolean;
  role?: BranchUserRole;
}) {
  return BranchUser.reconstitute({
    id: params.id,
    firstName: 'Ada',
    lastName: 'Khan',
    email: params.email,
    phone: params.phone ?? '9876543210',
    password: 'hash',
    role: params.role ?? BranchUserRole.FACULTY,
    permissions: [],
    branchId: 'branch-1',
    isActive: params.isActive ?? !params.isDeleted,
    isDeleted: params.isDeleted,
    lastLoginAt: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('resolveCreateIdentity', () => {
  it('creates when email and phone are unused', () => {
    expect(
      resolveCreateIdentity({ emailMatch: null, phoneMatch: null }),
    ).toEqual({ action: 'create' });
  });

  it('rejects an active email', () => {
    expect(() =>
      resolveCreateIdentity({
        emailMatch: user({
          id: 'u1',
          email: 'ada@example.com',
          isDeleted: false,
        }),
        phoneMatch: null,
      }),
    ).toThrow(
      expect.objectContaining({
        code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
        statusCode: 409,
        message: 'An active user already exists with this email.',
      }),
    );
  });

  it('restores a soft-deleted email match', () => {
    const existing = user({
      id: 'abc123',
      email: 'faculty@gmail.com',
      isDeleted: true,
    });

    expect(
      resolveCreateIdentity({ emailMatch: existing, phoneMatch: existing }),
    ).toEqual({ action: 'restore', user: existing });
  });

  it('rejects a new email with an active phone', () => {
    expect(() =>
      resolveCreateIdentity({
        emailMatch: null,
        phoneMatch: user({
          id: 'u2',
          email: 'other@example.com',
          phone: '9999999999',
          isDeleted: false,
        }),
      }),
    ).toThrow(
      expect.objectContaining({
        code: ERROR_CODES.PHONE_ALREADY_EXISTS,
        statusCode: 409,
      }),
    );
  });

  it('does not restore from phone-only deleted match', () => {
    expect(() =>
      resolveCreateIdentity({
        emailMatch: null,
        phoneMatch: user({
          id: 'u3',
          email: 'old@example.com',
          isDeleted: true,
        }),
      }),
    ).toThrow(
      expect.objectContaining({
        code: ERROR_CODES.PHONE_BELONGS_TO_DELETED_USER,
        statusCode: 409,
      }),
    );
  });

  it('rejects deleted email + different active phone', () => {
    expect(() =>
      resolveCreateIdentity({
        emailMatch: user({
          id: 'u4',
          email: 'faculty@gmail.com',
          isDeleted: true,
        }),
        phoneMatch: user({
          id: 'u5',
          email: 'other@example.com',
          phone: '9999999999',
          isDeleted: false,
        }),
      }),
    ).toThrow(
      expect.objectContaining({
        code: ERROR_CODES.PHONE_ALREADY_EXISTS,
      }),
    );
  });

  it('rejects deleted email + different deleted phone', () => {
    expect(() =>
      resolveCreateIdentity({
        emailMatch: user({
          id: 'u6',
          email: 'faculty@gmail.com',
          isDeleted: true,
        }),
        phoneMatch: user({
          id: 'u7',
          email: 'other@example.com',
          phone: '8888888888',
          isDeleted: true,
        }),
      }),
    ).toThrow(
      expect.objectContaining({
        code: ERROR_CODES.IDENTITY_MERGE_CONFLICT,
      }),
    );
  });
});
