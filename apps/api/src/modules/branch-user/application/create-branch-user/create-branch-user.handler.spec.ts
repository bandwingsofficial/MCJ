import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BranchUser } from '../../domain/entities/branch-user.entity';
import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { CreateBranchUserCommand } from './create-branch-user.command';
import { CreateBranchUserHandler } from './create-branch-user.handler';
import { BRANCH_MANAGER_CREATABLE_ROLES } from '../../domain/role-permissions';

describe('CreateBranchUserHandler uniqueness', () => {
  const hasher = {
    hash: jest.fn().mockResolvedValue('hashed-password'),
  };

  const makeRepo = (overrides: Record<string, unknown> = {}) => {
    const repo: Record<string, unknown> = {
      branchExists: jest.fn().mockResolvedValue(true),
      findByEmailIncludingDeleted: jest.fn().mockResolvedValue(null),
      findByPhoneIncludingDeleted: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
    repo.runInTransaction = jest.fn(async (work: (inner: unknown) => unknown) =>
      work(repo),
    );
    return repo;
  };

  const command = new CreateBranchUserCommand(
    'Anita',
    'Sharma',
    'anita@example.com',
    '9876543210',
    'Passw0rd!',
    BranchUserRole.FACULTY,
    undefined,
    'branch-1',
    'manager-1',
  );

  const deletedUser = BranchUser.reconstitute({
    id: 'abc123',
    firstName: 'Old',
    lastName: 'Name',
    email: 'anita@example.com',
    phone: '9876543210',
    password: 'old-hash',
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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  });

  it('rejects a duplicate active email with 409 before insert', async () => {
    const active = BranchUser.reconstitute({
      ...{
        id: 'existing',
        firstName: 'Anita',
        lastName: 'Sharma',
        email: 'anita@example.com',
        phone: '1111111111',
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
      },
    });
    const repo = makeRepo({
      findByEmailIncludingDeleted: jest.fn().mockResolvedValue(active),
    });

    const handler = new CreateBranchUserHandler(
      repo as never,
      hasher as never,
      new BranchUserDomainService(),
    );

    await expect(handler.execute(command)).rejects.toMatchObject({
      code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
      statusCode: 409,
      message: 'An active user already exists with this email.',
    });
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('asks for confirmation when the email belongs to a deleted user', async () => {
    const repo = makeRepo({
      findByEmailIncludingDeleted: jest.fn().mockResolvedValue(deletedUser),
      findByPhoneIncludingDeleted: jest.fn().mockResolvedValue(deletedUser),
    });

    const handler = new CreateBranchUserHandler(
      repo as never,
      hasher as never,
      new BranchUserDomainService(),
    );

    await expect(handler.execute(command)).rejects.toMatchObject({
      code: ERROR_CODES.DELETED_ACCOUNT_RESTORABLE,
      statusCode: 409,
    });
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('restores the same deleted user with current form data', async () => {
    const existing = BranchUser.reconstitute({
      id: 'abc123',
      firstName: 'Old',
      lastName: 'Name',
      email: 'anita@example.com',
      phone: '9876543210',
      password: 'old-hash',
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
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    });

    const repo = makeRepo({
      findByEmailIncludingDeleted: jest.fn().mockResolvedValue(existing),
      findByPhoneIncludingDeleted: jest.fn().mockResolvedValue(existing),
    });

    const handler = new CreateBranchUserHandler(
      repo as never,
      hasher as never,
      new BranchUserDomainService(),
    );

    const restoreCommand = new CreateBranchUserCommand(
      'Rahul',
      'Sharma',
      'anita@example.com',
      '9999999999',
      'Passw0rd!',
      BranchUserRole.FACULTY,
      undefined,
      'branch-1',
      'manager-1',
      true,
      {
        requireSameBranchId: 'branch-1',
        allowedExistingRoles: BRANCH_MANAGER_CREATABLE_ROLES,
      },
    );

    const result = await handler.execute(restoreCommand);

    expect(result.id).toBe('abc123');
    expect(result.firstName).toBe('Rahul');
    expect(result.lastName).toBe('Sharma');
    expect(result.phone).toBe('9999999999');
    expect(result.isActive).toBe(true);
    expect(result.restored).toBe(true);
    expect(existing.isDeleted).toBe(false);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('maps a unique-constraint race on save to 409', async () => {
    const repo = makeRepo({
      save: jest.fn().mockRejectedValue(
        new BaseException(
          ERROR_CODES.EMAIL_ALREADY_EXISTS,
          'An active user already exists with this email.',
          409,
          { field: 'email' },
        ),
      ),
    });

    const handler = new CreateBranchUserHandler(
      repo as never,
      hasher as never,
      new BranchUserDomainService(),
    );

    await expect(handler.execute(command)).rejects.toMatchObject({
      code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
      statusCode: 409,
    });
  });

  it('creates an active faculty user when the email is unique', async () => {
    const repo = makeRepo();
    const handler = new CreateBranchUserHandler(
      repo as never,
      hasher as never,
      new BranchUserDomainService(),
    );

    const result = await handler.execute(command);

    expect(result.email).toBe('anita@example.com');
    expect(result.role).toBe(BranchUserRole.FACULTY);
    expect(result.isActive).toBe(true);
    expect(result.restored).toBe(false);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('normalizes email case and whitespace through the value object', async () => {
    const repo = makeRepo();
    const handler = new CreateBranchUserHandler(
      repo as never,
      hasher as never,
      new BranchUserDomainService(),
    );

    const result = await handler.execute(
      new CreateBranchUserCommand(
        'Anita',
        'Sharma',
        '  Anita@Example.com  ',
        '9876543210',
        'Passw0rd!',
        BranchUserRole.FACULTY,
        undefined,
        'branch-1',
        'manager-1',
      ),
    );

    expect(result.email).toBe('anita@example.com');
  });
});
