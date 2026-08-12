import { CategoryDomainService } from './category-domain.service';
import { Category } from '../entities/category.entity';
import { CategoryStatus } from '../enums/category-status.enum';
import type { CategoryRepository } from '../repositories/category.repository';
import { BaseException } from '@common/exceptions/base.exception';

describe('CategoryDomainService', () => {
  const domain = new CategoryDomainService();

  const makeCategory = (overrides?: Partial<{ id: string; name: string; slug: string }>) =>
    Category.reconstitute({
      id: overrides?.id ?? 'cat-1',
      name: overrides?.name ?? 'ABC',
      slug: overrides?.slug ?? 'abc',
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

  const makeRepo = (
    overrides?: Partial<CategoryRepository>,
  ): CategoryRepository =>
    ({
      findByNameInsensitive: jest.fn().mockResolvedValue(null),
      findBySlug: jest.fn().mockResolvedValue(null),
      ...overrides,
    }) as unknown as CategoryRepository;

  it('rejects duplicate names including archived', async () => {
    const existing = makeCategory({ id: 'other' });
    const repo = makeRepo({
      findByNameInsensitive: jest.fn().mockResolvedValue(existing),
    });

    await expect(
      domain.ensureNameIsAvailable(repo, 'abc', null),
    ).rejects.toBeInstanceOf(BaseException);

    await expect(
      domain.ensureNameIsAvailable(repo, 'abc', null),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('allows updating the same category name', async () => {
    const existing = makeCategory({ id: 'cat-1' });
    const repo = makeRepo({
      findByNameInsensitive: jest.fn().mockResolvedValue(existing),
    });

    await expect(
      domain.ensureNameIsAvailable(repo, 'ABC', null, 'cat-1'),
    ).resolves.toBeUndefined();
  });

  it('blocks restore when another category owns the name', async () => {
    const archived = makeCategory({ id: 'archived' });
    const active = makeCategory({
      id: 'active',
      name: 'ABC',
    });

    const repo = makeRepo({
      findByNameInsensitive: jest.fn().mockResolvedValue(active),
    });

    await expect(
      domain.ensureCanRestore(repo, archived),
    ).rejects.toMatchObject({
      statusCode: 409,
      message:
        'Cannot restore category because another category already uses this name.',
    });
  });
});
