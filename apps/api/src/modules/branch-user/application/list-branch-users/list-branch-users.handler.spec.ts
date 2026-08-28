import { ListBranchUsersHandler } from './list-branch-users.handler';
import { ListBranchUsersQuery } from './list-branch-users.query';

describe('ListBranchUsersHandler', () => {
  it('lists users scoped to a branch', async () => {
    const branchUser = {
      id: 'user-1',
      firstName: { getValue: () => 'Akshay' },
      lastName: { getValue: () => 'Kumar' },
      email: { getValue: () => 'akshay@example.com' },
      phone: { getValue: () => '9876543210' },
      role: 'BRANCH_MANAGER',
      permissions: [],
      branchId: 'branch-1',
      isActive: true,
      isDeleted: false,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const branchUserRepo = {
      findAll: jest.fn().mockResolvedValue([branchUser]),
      count: jest.fn().mockResolvedValue(1),
    };

    const branchRepo = {
      findByIdIncludingDeleted: jest.fn().mockResolvedValue({
        branchName: { getValue: () => 'Malleswaram' },
        branchCode: { getValue: () => 'MAL001' },
      }),
      findById: jest.fn().mockResolvedValue({
        branchName: { getValue: () => 'Malleswaram' },
        branchCode: { getValue: () => 'MAL001' },
      }),
    };

    const handler = new ListBranchUsersHandler(
      branchUserRepo as never,
      branchRepo as never,
    );

    const result = await handler.execute(
      new ListBranchUsersQuery(
        'branch-1',
        undefined,
        undefined,
        undefined,
        false,
        0,
        20,
      ),
    );

    expect(result.count).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(branchUserRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: 'branch-1' }),
    );
    expect(branchUserRepo.count).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: 'branch-1' }),
    );
  });

  it('rejects invalid branch id', async () => {
    const branchUserRepo = {
      findAll: jest.fn(),
      count: jest.fn(),
    };

    const branchRepo = {
      findByIdIncludingDeleted: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
    };

    const handler = new ListBranchUsersHandler(
      branchUserRepo as never,
      branchRepo as never,
    );

    await expect(
      handler.execute(
        new ListBranchUsersQuery('missing-branch'),
      ),
    ).rejects.toThrow('Branch not found');

    expect(branchUserRepo.findAll).not.toHaveBeenCalled();
  });
});
