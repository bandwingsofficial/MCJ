import { Branch } from '../domain/entities/branch.entity';
import { BranchStatus } from '../domain/enums/branch-status.enum';

import { BulkDeleteBranchesHandler } from './bulk-delete-branches/bulk-delete-branches.handler';
import { BulkDeleteBranchesCommand } from './bulk-delete-branches/bulk-delete-branches.command';

import { BulkUpdateBranchStatusHandler } from './bulk-update-branch-status/bulk-update-branch-status.handler';
import { BulkUpdateBranchStatusCommand } from './bulk-update-branch-status/bulk-update-branch-status.command';

import { BulkRestoreBranchesHandler } from './bulk-restore-branches/bulk-restore-branches.handler';
import { BulkRestoreBranchesCommand } from './bulk-restore-branches/bulk-restore-branches.command';

import { BulkPermanentDeleteBranchesHandler } from './bulk-permanent-delete-branches/bulk-permanent-delete-branches.handler';
import { BulkPermanentDeleteBranchesCommand } from './bulk-permanent-delete-branches/bulk-permanent-delete-branches.command';

const makeBranch = (params: {
  id: string;
  status?: BranchStatus;
  displayOrder?: number | null;
  deletedAt?: Date | null;
}) =>
  Branch.reconstitute({
    id: params.id,
    branchName: `Branch ${params.id}`,
    branchCode: `BR-${params.id}`,
    email: null,
    phone: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    country: null,
    postalCode: null,
    latitude: null,
    longitude: null,
    status: params.status ?? BranchStatus.ACTIVE,
    description: null,
    displayOrder: params.displayOrder ?? null,
    deletedAt: params.deletedAt ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('Bulk branch handlers', () => {
  describe('BulkUpdateBranchStatusHandler', () => {
    it('activates inactive branches and skips already active branches', async () => {
      const inactive = makeBranch({
        id: 'inactive',
        status: BranchStatus.INACTIVE,
        displayOrder: null,
      });
      const active = makeBranch({
        id: 'active',
        status: BranchStatus.ACTIVE,
        displayOrder: 1,
      });

      const branchRepo = {
        findByIdIncludingDeleted: jest
          .fn()
          .mockImplementation(async (id: string) => {
            if (id === 'inactive') {
              return inactive;
            }
            if (id === 'active') {
              return active;
            }
            return null;
          }),
        getMaxActiveDisplayOrder: jest.fn().mockResolvedValue(2),
        save: jest.fn().mockResolvedValue(undefined),
      };

      const handler = new BulkUpdateBranchStatusHandler(
        branchRepo as never,
      );

      const result = await handler.execute(
        new BulkUpdateBranchStatusCommand(
          ['inactive', 'active'],
          BranchStatus.ACTIVE,
        ),
      );

      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(branchRepo.save).toHaveBeenCalledTimes(1);
      expect(inactive.status).toBe(BranchStatus.ACTIVE);
      expect(inactive.displayOrder).toBe(3);
    });

    it('rejects archived branches for status updates', async () => {
      const archived = makeBranch({
        id: 'archived',
        status: BranchStatus.INACTIVE,
        deletedAt: new Date(),
      });

      const branchRepo = {
        findByIdIncludingDeleted: jest
          .fn()
          .mockResolvedValue(archived),
        getMaxActiveDisplayOrder: jest.fn(),
        closeDisplayOrderGap: jest.fn(),
        save: jest.fn(),
      };

      const handler = new BulkUpdateBranchStatusHandler(
        branchRepo as never,
      );

      const result = await handler.execute(
        new BulkUpdateBranchStatusCommand(
          ['archived'],
          BranchStatus.ACTIVE,
        ),
      );

      expect(result.failedCount).toBe(1);
      expect(result.failures[0].message).toContain('Archived');
      expect(branchRepo.save).not.toHaveBeenCalled();
    });

    it('deactivates active branches and closes display-order gaps', async () => {
      const active = makeBranch({
        id: 'active',
        status: BranchStatus.ACTIVE,
        displayOrder: 2,
      });

      const branchRepo = {
        findByIdIncludingDeleted: jest
          .fn()
          .mockResolvedValue(active),
        closeDisplayOrderGap: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
      };

      const handler = new BulkUpdateBranchStatusHandler(
        branchRepo as never,
      );

      const result = await handler.execute(
        new BulkUpdateBranchStatusCommand(
          ['active'],
          BranchStatus.INACTIVE,
        ),
      );

      expect(result.successCount).toBe(1);
      expect(branchRepo.closeDisplayOrderGap).toHaveBeenCalledWith(2);
      expect(active.status).toBe(BranchStatus.INACTIVE);
      expect(active.displayOrder).toBeNull();
    });
  });

  describe('BulkDeleteBranchesHandler', () => {
    it('soft deletes active branches and skips archived branches', async () => {
      const active = makeBranch({
        id: 'active',
        displayOrder: 1,
      });
      const archived = makeBranch({
        id: 'archived',
        deletedAt: new Date(),
      });

      const branchRepo = {
        findByIdIncludingDeleted: jest
          .fn()
          .mockImplementation(async (id: string) => {
            if (id === 'active') {
              return active;
            }
            return archived;
          }),
        closeDisplayOrderGap: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
      };

      const handler = new BulkDeleteBranchesHandler(
        branchRepo as never,
      );

      const result = await handler.execute(
        new BulkDeleteBranchesCommand(['active', 'archived']),
      );

      expect(result.successCount).toBe(2);
      expect(branchRepo.save).toHaveBeenCalledTimes(1);
      expect(active.isDeleted()).toBe(true);
    });
  });

  describe('BulkRestoreBranchesHandler', () => {
    it('restores archived branches and reports active branches as failures', async () => {
      const archived = makeBranch({
        id: 'archived',
        deletedAt: new Date(),
      });
      const active = makeBranch({ id: 'active' });

      const branchRepo = {
        findByIdIncludingDeleted: jest
          .fn()
          .mockImplementation(async (id: string) => {
            if (id === 'archived') {
              return archived;
            }
            return active;
          }),
        getMaxDisplayOrder: jest.fn().mockResolvedValue(4),
        save: jest.fn().mockResolvedValue(undefined),
      };

      const handler = new BulkRestoreBranchesHandler(
        branchRepo as never,
      );

      const result = await handler.execute(
        new BulkRestoreBranchesCommand(['archived', 'active']),
      );

      expect(result.successCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(archived.isDeleted()).toBe(false);
      expect(archived.displayOrder).toBe(5);
    });
  });

  describe('BulkPermanentDeleteBranchesHandler', () => {
    it('permanently deletes archived branches without blocking references', async () => {
      const archived = makeBranch({
        id: 'archived',
        deletedAt: new Date(),
      });

      const branchRepo = {
        findByIdIncludingDeleted: jest
          .fn()
          .mockResolvedValue(archived),
        countBlockingReferences: jest.fn().mockResolvedValue({
          branchUsers: 0,
          students: 0,
          trainers: 0,
          enrollments: 0,
          batches: 0,
          categories: 0,
          courseBranches: 0,
        }),
        deletePermanent: jest.fn().mockResolvedValue(undefined),
        closeDisplayOrderGap: jest.fn(),
      };

      const handler = new BulkPermanentDeleteBranchesHandler(
        branchRepo as never,
      );

      const result = await handler.execute(
        new BulkPermanentDeleteBranchesCommand(['archived']),
      );

      expect(result.successCount).toBe(1);
      expect(branchRepo.deletePermanent).toHaveBeenCalledWith('archived');
    });

    it('blocks permanent delete for active branches and branches with references', async () => {
      const active = makeBranch({ id: 'active' });
      const archived = makeBranch({
        id: 'archived',
        deletedAt: new Date(),
      });

      const branchRepo = {
        findByIdIncludingDeleted: jest
          .fn()
          .mockImplementation(async (id: string) => {
            if (id === 'active') {
              return active;
            }
            return archived;
          }),
        countBlockingReferences: jest.fn().mockResolvedValue({
          branchUsers: 0,
          students: 2,
          trainers: 0,
          enrollments: 0,
          batches: 0,
          categories: 0,
          courseBranches: 0,
        }),
        deletePermanent: jest.fn(),
      };

      const handler = new BulkPermanentDeleteBranchesHandler(
        branchRepo as never,
      );

      const result = await handler.execute(
        new BulkPermanentDeleteBranchesCommand(['active', 'archived']),
      );

      expect(result.failedCount).toBe(2);
      expect(branchRepo.deletePermanent).not.toHaveBeenCalled();
    });
  });
});
