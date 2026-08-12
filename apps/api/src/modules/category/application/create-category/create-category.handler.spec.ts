import { CreateCategoryHandler } from './create-category.handler';
import { CreateCategoryCommand } from './create-category.command';
import { CategoryDomainService } from '../../domain/services/category-domain.service';
import { ERROR_CODES } from '@common/constants/error-codes';

describe('CreateCategoryHandler', () => {
  const domainService = new CategoryDomainService();

  const buildHandler = (repoOverrides?: Record<string, unknown>) => {
    const categoryRepo = {
      findByNameInsensitive: jest.fn().mockResolvedValue(null),
      findBySlug: jest.fn().mockResolvedValue(null),
      getMaxDisplayOrder: jest.fn().mockResolvedValue(2),
      incrementDisplayOrdersFrom: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      ...repoOverrides,
    };

    const branchRepo = {
      findById: jest.fn(),
    };

    const uploadDomainService = {
      attachToEntity: jest.fn(),
    };

    return {
      handler: new CreateCategoryHandler(
        categoryRepo as never,
        domainService,
        branchRepo as never,
        uploadDomainService as never,
      ),
      categoryRepo,
    };
  };

  it('auto-assigns the next display order', async () => {
    const { handler, categoryRepo } = buildHandler();

    const result = await handler.execute(
      new CreateCategoryCommand(
        'New Category',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'admin',
      ),
    );

    expect(categoryRepo.getMaxDisplayOrder).toHaveBeenCalled();
    expect(result.displayOrder).toBe(3);
    expect(categoryRepo.save).toHaveBeenCalled();
  });

  it('rejects duplicate names against archived categories', async () => {
    const { handler } = buildHandler({
      findByNameInsensitive: jest.fn().mockResolvedValue({
        id: 'archived-1',
      }),
    });

    await expect(
      handler.execute(
        new CreateCategoryCommand(
          'ABC',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          'admin',
        ),
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        code: ERROR_CODES.CATEGORY_ALREADY_EXISTS,
        statusCode: 409,
      }),
    );
  });
});
