import { PermanentDeleteCategoryHandler } from './permanent-delete-category.handler';
import { PermanentDeleteCategoryCommand } from './permanent-delete-category.command';
import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

describe('PermanentDeleteCategoryHandler', () => {
  const makeArchived = () =>
    Category.reconstitute({
      id: 'cat-1',
      name: 'Old',
      slug: 'old',
      description: null,
      thumbnailFileId: null,
      thumbnailUrl: null,
      status: CategoryStatus.ARCHIVED,
      displayOrder: null,
      branchId: null,
      createdBy: 'admin',
      updatedBy: null,
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  it('permanently deletes an archived category with no references', async () => {
    const category = makeArchived();
    const categoryRepo = {
      findById: jest.fn().mockResolvedValue(category),
      countBlockingReferences: jest.fn().mockResolvedValue({
        courses: 0,
        enrollments: 0,
        articles: 0,
      }),
      deletePermanent: jest.fn().mockResolvedValue(undefined),
      closeDisplayOrderGap: jest.fn(),
    };
    const uploadDomainService = {
      softDelete: jest.fn(),
    };

    const handler = new PermanentDeleteCategoryHandler(
      categoryRepo as never,
      new CategoryDomainService(),
      uploadDomainService as never,
    );

    const result = await handler.execute(
      new PermanentDeleteCategoryCommand('cat-1'),
    );

    expect(categoryRepo.deletePermanent).toHaveBeenCalledWith('cat-1');
    expect(result.permanentlyDeleted).toBe(true);
  });

  it('rejects permanent delete when courses still reference the category', async () => {
    const category = makeArchived();
    const categoryRepo = {
      findById: jest.fn().mockResolvedValue(category),
      countBlockingReferences: jest.fn().mockResolvedValue({
        courses: 1,
        enrollments: 0,
        articles: 0,
      }),
      deletePermanent: jest.fn(),
    };

    const handler = new PermanentDeleteCategoryHandler(
      categoryRepo as never,
      new CategoryDomainService(),
      { softDelete: jest.fn() } as never,
    );

    await expect(
      handler.execute(new PermanentDeleteCategoryCommand('cat-1')),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('1 course'),
    });
    expect(categoryRepo.deletePermanent).not.toHaveBeenCalled();
  });

  it('rejects permanent delete for non-archived categories', async () => {
    const active = makeArchived();
    active.restore('admin');

    const categoryRepo = {
      findById: jest.fn().mockResolvedValue(active),
      countBlockingReferences: jest.fn(),
      deletePermanent: jest.fn(),
    };

    const handler = new PermanentDeleteCategoryHandler(
      categoryRepo as never,
      new CategoryDomainService(),
      { softDelete: jest.fn() } as never,
    );

    await expect(
      handler.execute(new PermanentDeleteCategoryCommand('cat-1')),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(categoryRepo.deletePermanent).not.toHaveBeenCalled();
  });
});
