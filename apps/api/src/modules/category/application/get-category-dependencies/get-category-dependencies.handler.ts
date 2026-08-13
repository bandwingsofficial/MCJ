import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

export class CategoryDependencyCounts {
  constructor(
    public readonly branches: number,
    public readonly courses: number,
    public readonly enrollments: number,
    public readonly articles: number,
  ) {}
}

export class GetCategoryDependenciesResult {
  constructor(
    public readonly categoryId: string,
    public readonly categoryName: string,
    public readonly canDelete: boolean,
    public readonly removable: CategoryDependencyCounts,
    public readonly blocking: CategoryDependencyCounts,
  ) {}
}

export class GetCategoryDependenciesHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    categoryId: string,
  ): Promise<GetCategoryDependenciesResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(categoryId, true),
    );

    const refs = await this.categoryRepo.countBlockingReferences(
      category.id,
    );

    // BranchCategory assignments are removable with permanent delete.
    const removable = new CategoryDependencyCounts(
      refs.branches,
      0,
      0,
      0,
    );

    // Course / Enrollment / Article categoryId is required — cannot null safely.
    const blocking = new CategoryDependencyCounts(
      0,
      refs.courses,
      refs.enrollments,
      refs.articles,
    );

    const canDelete =
      blocking.courses +
        blocking.enrollments +
        blocking.articles ===
      0;

    return new GetCategoryDependenciesResult(
      category.id,
      category.name.getValue(),
      canDelete,
      removable,
      blocking,
    );
  }
}
