import { DeleteCategoryHandler } from './delete-category.handler';
import { DeleteCategoryCommand } from './delete-category.command';
import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

describe('DeleteCategoryHandler', () => {
  it('soft-deletes the same record and closes the order gap', async () => {
    const category = Category.reconstitute({
      id: 'cat-2',
      name: 'DEF',
      slug: 'def',
      description: null,
      thumbnailFileId: null,
      thumbnailUrl: null,
      status: CategoryStatus.ACTIVE,
      displayOrder: 2,
      branchId: null,
      createdBy: 'admin',
      updatedBy: null,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const categoryRepo = {
      findById: jest.fn().mockResolvedValue(category),
      save: jest.fn().mockResolvedValue(undefined),
      closeDisplayOrderGap: jest.fn().mockResolvedValue(undefined),
    };

    const handler = new DeleteCategoryHandler(
      categoryRepo as never,
      new CategoryDomainService(),
    );

    const result = await handler.execute(
      new DeleteCategoryCommand('cat-2', 'admin'),
    );

    expect(result.deleted).toBe(true);
    expect(category.isDeleted).toBe(true);
    expect(category.status).toBe(CategoryStatus.ARCHIVED);
    expect(category.displayOrder).toBeNull();
    expect(categoryRepo.closeDisplayOrderGap).toHaveBeenCalledWith(
      2,
      null,
    );
  });
});
