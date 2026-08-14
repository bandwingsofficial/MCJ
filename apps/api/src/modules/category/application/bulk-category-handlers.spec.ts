import { Category } from '../domain/entities/category.entity';
import { CategoryStatus } from '../domain/enums/category-status.enum';

import { BulkDeleteCategoryHandler } from './bulk-delete-category/bulk-delete-category.handler';
import { BulkDeleteCategoryCommand } from './bulk-delete-category/bulk-delete-category.command';

import { BulkUpdateCategoryStatusHandler } from './bulk-update-category-status/bulk-update-category-status.handler';
import { BulkUpdateCategoryStatusCommand } from './bulk-update-category-status/bulk-update-category-status.command';

import { BulkRestoreCategoryHandler } from './bulk-restore-category/bulk-restore-category.handler';
import { BulkRestoreCategoryCommand } from './bulk-restore-category/bulk-restore-category.command';

import { BulkPermanentDeleteCategoryHandler } from './bulk-permanent-delete-category/bulk-permanent-delete-category.handler';
import { BulkPermanentDeleteCategoryCommand } from './bulk-permanent-delete-category/bulk-permanent-delete-category.command';

import { CategoryDomainService } from '../domain/services/category-domain.service';

const makeCategory = (params: {
  id: string;
  status?: CategoryStatus;
  displayOrder?: number | null;
  isDeleted?: boolean;
}) =>
  Category.reconstitute({
    id: params.id,
    name: `Category ${params.id}`,
    slug: `category-${params.id}`,
    description: null,
    thumbnailFileId: null,
    thumbnailUrl: null,
    status: params.status ?? CategoryStatus.ACTIVE,
    displayOrder: params.displayOrder ?? null,
    createdBy: null,
    updatedBy: null,
    isDeleted: params.isDeleted ?? false,
    deletedAt: params.isDeleted ? new Date() : null,
    deletedBy: params.isDeleted ? 'user' : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('Bulk category handlers', () => {
  describe('BulkUpdateCategoryStatusHandler', () => {
    it('activates inactive categories and skips already active categories', async () => {
      const inactive = makeCategory({
        id: 'inactive',
        status: CategoryStatus.INACTIVE,
        displayOrder: null,
      });
      const active = makeCategory({
        id: 'active',
        status: CategoryStatus.ACTIVE,
        displayOrder: 1,
      });

      const categoryRepo = {
        findById: jest
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
        normalizeOrderedDisplayOrders: jest.fn(),
      };

      const handler = new BulkUpdateCategoryStatusHandler(
        categoryRepo as never,
      );

      const result = await handler.execute(
        new BulkUpdateCategoryStatusCommand(
          ['inactive', 'active'],
          CategoryStatus.ACTIVE,
        ),
      );

      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(categoryRepo.save).toHaveBeenCalledTimes(1);
      expect(inactive.status).toBe(CategoryStatus.ACTIVE);
      expect(inactive.displayOrder).toBe(3);
    });

    it('rejects archived categories for status updates', async () => {
      const archived = makeCategory({
        id: 'archived',
        status: CategoryStatus.ARCHIVED,
        isDeleted: true,
      });

      const categoryRepo = {
        findById: jest.fn().mockResolvedValue(archived),
        getMaxActiveDisplayOrder: jest.fn(),
        save: jest.fn(),
        normalizeOrderedDisplayOrders: jest.fn(),
      };

      const handler = new BulkUpdateCategoryStatusHandler(
        categoryRepo as never,
      );

      const result = await handler.execute(
        new BulkUpdateCategoryStatusCommand(
          ['archived'],
          CategoryStatus.ACTIVE,
        ),
      );

      expect(result.failedCount).toBe(1);
      expect(result.failures[0].message).toContain('Archived');
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it('deactivates active categories and clears branch assignments', async () => {
      const active = makeCategory({
        id: 'active',
        status: CategoryStatus.ACTIVE,
        displayOrder: 2,
      });

      const categoryRepo = {
        findById: jest.fn().mockResolvedValue(active),
        closeDisplayOrderGap: jest.fn().mockResolvedValue(undefined),
        removeBranchAssignments: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
        normalizeOrderedDisplayOrders: jest.fn(),
      };

      const handler = new BulkUpdateCategoryStatusHandler(
        categoryRepo as never,
      );

      const result = await handler.execute(
        new BulkUpdateCategoryStatusCommand(
          ['active'],
          CategoryStatus.INACTIVE,
        ),
      );

      expect(result.successCount).toBe(1);
      expect(categoryRepo.closeDisplayOrderGap).toHaveBeenCalledWith(2);
      expect(categoryRepo.removeBranchAssignments).toHaveBeenCalledWith(
        'active',
      );
      expect(active.status).toBe(CategoryStatus.INACTIVE);
      expect(active.displayOrder).toBeNull();
    });
  });

  describe('BulkDeleteCategoryHandler', () => {
    it('soft deletes active categories and skips archived categories', async () => {
      const active = makeCategory({
        id: 'active',
        displayOrder: 1,
      });
      const archived = makeCategory({
        id: 'archived',
        isDeleted: true,
        status: CategoryStatus.ARCHIVED,
      });

      const categoryRepo = {
        findById: jest
          .fn()
          .mockImplementation(async (id: string) => {
            if (id === 'active') {
              return active;
            }
            return archived;
          }),
        removeBranchAssignments: jest.fn().mockResolvedValue(undefined),
        closeDisplayOrderGap: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
        normalizeOrderedDisplayOrders: jest.fn(),
      };

      const handler = new BulkDeleteCategoryHandler(
        categoryRepo as never,
      );

      const result = await handler.execute(
        new BulkDeleteCategoryCommand(['active', 'archived']),
      );

      expect(result.successCount).toBe(2);
      expect(categoryRepo.save).toHaveBeenCalledTimes(1);
      expect(active.isDeleted).toBe(true);
    });
  });

  describe('BulkRestoreCategoryHandler', () => {
    it('restores archived categories and reports active categories as failures', async () => {
      const archived = makeCategory({
        id: 'archived',
        isDeleted: true,
        status: CategoryStatus.ARCHIVED,
      });
      const active = makeCategory({ id: 'active' });

      const categoryRepo = {
        findById: jest
          .fn()
          .mockImplementation(async (id: string) => {
            if (id === 'archived') {
              return archived;
            }
            return active;
          }),
        getMaxDisplayOrder: jest.fn().mockResolvedValue(4),
        save: jest.fn().mockResolvedValue(undefined),
        normalizeOrderedDisplayOrders: jest.fn(),
      };

      const domainService = {
        ensureCanRestore: jest.fn().mockResolvedValue(undefined),
      };

      const handler = new BulkRestoreCategoryHandler(
        categoryRepo as never,
        domainService as unknown as CategoryDomainService,
      );

      const result = await handler.execute(
        new BulkRestoreCategoryCommand(['archived', 'active']),
      );

      expect(result.successCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(archived.isDeleted).toBe(false);
      expect(archived.displayOrder).toBe(5);
    });
  });

  describe('BulkPermanentDeleteCategoryHandler', () => {
    it('permanently deletes archived categories without blocking references', async () => {
      const archived = makeCategory({
        id: 'archived',
        isDeleted: true,
        status: CategoryStatus.ARCHIVED,
      });

      const categoryRepo = {
        findById: jest.fn().mockResolvedValue(archived),
        countBlockingReferences: jest.fn().mockResolvedValue({
          courses: 0,
          enrollments: 0,
          articles: 0,
          branches: 0,
        }),
        removeBranchAssignments: jest.fn().mockResolvedValue(undefined),
        deletePermanent: jest.fn().mockResolvedValue(undefined),
        closeDisplayOrderGap: jest.fn(),
      };

      const uploadDomainService = {
        softDelete: jest.fn(),
      };

      const handler = new BulkPermanentDeleteCategoryHandler(
        categoryRepo as never,
        uploadDomainService as never,
      );

      const result = await handler.execute(
        new BulkPermanentDeleteCategoryCommand(['archived']),
      );

      expect(result.successCount).toBe(1);
      expect(categoryRepo.deletePermanent).toHaveBeenCalledWith('archived');
    });

    it('blocks permanent delete for active categories and referenced categories', async () => {
      const active = makeCategory({ id: 'active' });
      const archived = makeCategory({
        id: 'archived',
        isDeleted: true,
        status: CategoryStatus.ARCHIVED,
      });

      const categoryRepo = {
        findById: jest
          .fn()
          .mockImplementation(async (id: string) => {
            if (id === 'active') {
              return active;
            }
            return archived;
          }),
        countBlockingReferences: jest.fn().mockResolvedValue({
          courses: 2,
          enrollments: 0,
          articles: 0,
          branches: 0,
        }),
        deletePermanent: jest.fn(),
      };

      const handler = new BulkPermanentDeleteCategoryHandler(
        categoryRepo as never,
        { softDelete: jest.fn() } as never,
      );

      const result = await handler.execute(
        new BulkPermanentDeleteCategoryCommand(['active', 'archived']),
      );

      expect(result.failedCount).toBe(2);
      expect(categoryRepo.deletePermanent).not.toHaveBeenCalled();
    });
  });
});
