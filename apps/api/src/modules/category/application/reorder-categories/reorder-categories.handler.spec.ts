import { ReorderCategoriesHandler } from './reorder-categories.handler';
import { ReorderCategoriesCommand } from './reorder-categories.command';
import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

describe('ReorderCategoriesHandler', () => {
  const makeCategory = (displayOrder: number) =>
    Category.reconstitute({
      id: 'cat-1',
      name: 'ABC',
      slug: 'abc',
      description: null,
      thumbnailFileId: null,
      thumbnailUrl: null,
      status: CategoryStatus.ACTIVE,
      displayOrder,
      branchId: null,
      createdBy: 'admin',
      updatedBy: null,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  it('persists a move via transactional moveDisplayOrder', async () => {
    const category = makeCategory(3);
    const categoryRepo = {
      findById: jest.fn().mockResolvedValue(category),
      getMaxDisplayOrder: jest.fn().mockResolvedValue(4),
      moveDisplayOrder: jest.fn().mockResolvedValue(undefined),
    };
    const domainService = new CategoryDomainService();
    const handler = new ReorderCategoriesHandler(
      categoryRepo as never,
      domainService,
    );

    const result = await handler.execute(
      new ReorderCategoriesCommand('cat-1', 1, 'admin'),
    );

    expect(categoryRepo.moveDisplayOrder).toHaveBeenCalledWith(
      'cat-1',
      3,
      1,
      null,
    );
    expect(result.displayOrder).toBe(1);
  });

  it('rejects reordering archived categories', async () => {
    const archived = makeCategory(1);
    archived.softDelete('admin');

    const categoryRepo = {
      findById: jest.fn().mockResolvedValue(archived),
      getMaxDisplayOrder: jest.fn(),
      moveDisplayOrder: jest.fn(),
    };
    const handler = new ReorderCategoriesHandler(
      categoryRepo as never,
      new CategoryDomainService(),
    );

    await expect(
      handler.execute(new ReorderCategoriesCommand('cat-1', 2)),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
