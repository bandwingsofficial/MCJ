import { RestoreCategoryHandler } from './restore-category.handler';
import { RestoreCategoryCommand } from './restore-category.command';
import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

describe('RestoreCategoryHandler', () => {
  it('restores at the end of the active ordering', async () => {
    const category = Category.reconstitute({
      id: 'cat-2',
      name: 'DEF',
      slug: 'def',
      description: null,
      thumbnailFileId: null,
      thumbnailUrl: null,
      status: CategoryStatus.ARCHIVED,
      displayOrder: null,
      createdBy: 'admin',
      updatedBy: null,
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const categoryRepo = {
      findById: jest.fn().mockResolvedValue(category),
      findByNameInsensitive: jest.fn().mockResolvedValue(category),
      findBySlug: jest.fn().mockResolvedValue(category),
      getMaxDisplayOrder: jest.fn().mockResolvedValue(3),
      save: jest.fn().mockResolvedValue(undefined),
      normalizeOrderedDisplayOrders: jest
        .fn()
        .mockResolvedValue(undefined),
    };

    const handler = new RestoreCategoryHandler(
      categoryRepo as never,
      new CategoryDomainService(),
    );

    const result = await handler.execute(
      new RestoreCategoryCommand('cat-2', 'admin'),
    );

    expect(result.status).toBe(CategoryStatus.ACTIVE);
    expect(result.displayOrder).toBe(4);
    expect(category.isDeleted).toBe(false);
  });
});
