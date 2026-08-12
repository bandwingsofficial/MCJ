import { ReorderBranchesHandler } from './reorder-branches.handler';
import { ReorderBranchesCommand } from './reorder-branches.command';
import { BranchStatus } from '../../domain/enums/branch-status.enum';

describe('ReorderBranchesHandler', () => {
  const makeBranch = (overrides?: {
    displayOrder?: number | null;
    status?: BranchStatus;
    deletedAt?: Date | null;
  }) =>
    ({
      id: 'branch-1',
      displayOrder: overrides?.displayOrder ?? 2,
      status: overrides?.status ?? BranchStatus.ACTIVE,
      isDeleted: () => Boolean(overrides?.deletedAt),
    }) as never;

  it('moves a branch to a new display order', async () => {
    const branchRepo = {
      findById: jest.fn().mockResolvedValue(makeBranch()),
      getMaxDisplayOrder: jest.fn().mockResolvedValue(4),
      moveDisplayOrder: jest.fn().mockResolvedValue(undefined),
    };

    const domainService = {
      ensureBranchExists: jest.fn(),
    };

    const handler = new ReorderBranchesHandler(
      branchRepo as never,
      domainService as never,
    );

    const result = await handler.execute(
      new ReorderBranchesCommand('branch-1', 1),
    );

    expect(branchRepo.moveDisplayOrder).toHaveBeenCalledWith(
      'branch-1',
      2,
      1,
    );
    expect(result.displayOrder).toBe(1);
  });

  it('rejects reordering inactive branches', async () => {
    const branchRepo = {
      findById: jest.fn().mockResolvedValue(
        makeBranch({ status: BranchStatus.INACTIVE, displayOrder: null }),
      ),
      getMaxDisplayOrder: jest.fn(),
      moveDisplayOrder: jest.fn(),
    };

    const domainService = {
      ensureBranchExists: jest.fn(),
    };

    const handler = new ReorderBranchesHandler(
      branchRepo as never,
      domainService as never,
    );

    await expect(
      handler.execute(new ReorderBranchesCommand('branch-1', 1)),
    ).rejects.toMatchObject({
      message: expect.stringContaining('cannot be reordered'),
    });
  });
});
