import { ERROR_CODES } from '@common/constants/error-codes';

import { BranchUser } from '../../domain/entities/branch-user.entity';
import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { PermanentDeleteBranchUserCommand } from './permanent-delete-branch-user.command';
import { PermanentDeleteBranchUserHandler } from './permanent-delete-branch-user.handler';

describe('PermanentDeleteBranchUserHandler', () => {
  const deleted = BranchUser.reconstitute({
    id: 'user-1',
    firstName: 'Ada',
    lastName: 'Khan',
    email: 'ada@example.com',
    phone: '9876543210',
    password: 'hash',
    role: BranchUserRole.FACULTY,
    permissions: [],
    branchId: 'branch-1',
    isActive: false,
    isDeleted: true,
    lastLoginAt: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it('permanently deletes a soft-deleted user', async () => {
    const repo = {
      findByIdIncludingDeleted: jest.fn().mockResolvedValue(deleted),
      permanentDelete: jest.fn().mockResolvedValue(undefined),
    };

    const handler = new PermanentDeleteBranchUserHandler(repo as never);
    const result = await handler.execute(
      new PermanentDeleteBranchUserCommand('user-1', 'admin-1'),
    );

    expect(result.permanentlyDeleted).toBe(true);
    expect(repo.permanentDelete).toHaveBeenCalledWith('user-1');
  });

  it('returns 404 when the user is already gone', async () => {
    const repo = {
      findByIdIncludingDeleted: jest.fn().mockResolvedValue(null),
      permanentDelete: jest.fn(),
    };
    const handler = new PermanentDeleteBranchUserHandler(repo as never);

    await expect(
      handler.execute(new PermanentDeleteBranchUserCommand('missing', 'admin-1')),
    ).rejects.toMatchObject({
      code: ERROR_CODES.BRANCH_USER_NOT_FOUND,
      statusCode: 404,
      message: 'User not found.',
    });
    expect(repo.permanentDelete).not.toHaveBeenCalled();
  });

  it('rejects permanent delete of an active user', async () => {
    const active = BranchUser.reconstitute({
      id: 'user-2',
      firstName: 'Ada',
      lastName: 'Khan',
      email: 'ada@example.com',
      phone: '9876543210',
      password: 'hash',
      role: BranchUserRole.FACULTY,
      permissions: [],
      branchId: 'branch-1',
      isActive: true,
      isDeleted: false,
      lastLoginAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      createdBy: null,
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo = {
      findByIdIncludingDeleted: jest.fn().mockResolvedValue(active),
      permanentDelete: jest.fn(),
    };
    const handler = new PermanentDeleteBranchUserHandler(repo as never);

    await expect(
      handler.execute(new PermanentDeleteBranchUserCommand('user-2', 'admin-1')),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Only deleted users can be permanently deleted.',
    });
  });
});
