import { UpdateCategoryStatusHandler } from './update-category-status.handler';
import { UpdateCategoryStatusCommand } from './update-category-status.command';
import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

describe('UpdateCategoryStatusHandler', () => {
  const makeActive = () =>
    Category.reconstitute({
      id: 'cat-1',
      name: 'Accounting',
      slug: 'accounting',
      description: null,
      thumbnailFileId: null,
      thumbnailUrl: null,
      status: CategoryStatus.ACTIVE,
      displayOrder: 1,
      createdBy: 'admin',
      updatedBy: null,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  it('blocks deactivation when courses reference the category', async () => {
    const category = makeActive();
    const categoryRepo = {
      findById: jest.fn().mockResolvedValue(category),
      countBlockingReferences: jest.fn().mockResolvedValue({
        courses: 2,
        enrollments: 0,
        articles: 0,
        branches: 0,
      }),
      findBlockingCourseNames: jest
        .fn()
        .mockResolvedValue(['Junior Accountant', 'Tally Foundation']),
      save: jest.fn(),
    };

    const handler = new UpdateCategoryStatusHandler(
      categoryRepo as never,
      new CategoryDomainService(),
    );

    await expect(
      handler.execute(
        new UpdateCategoryStatusCommand('cat-1', false, 'admin'),
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('Junior Accountant'),
    });

    expect(categoryRepo.save).not.toHaveBeenCalled();
  });
});
