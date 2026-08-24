import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';

import type { CourseRepository } from '../../domain/repositories/course.repository';
import {
  GetCourseResult,
  CourseBranchResult,
  CourseCategoryResult,
} from '../get-course/get-course.result';

import { ListCoursesQuery } from './list-courses.query';
import { ListCoursesResult } from './list-courses.result';

import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/branch/domain/errors/branch-not-found.exception';

export class ListCoursesHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly branchRepo: BranchRepository,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(
    query: ListCoursesQuery,
  ): Promise<ListCoursesResult> {
    const filters = {
      categoryId: query.categoryId,
      branchId: query.branchId,
      status: query.status,
      search: query.search,
      mode: query.mode,
      isFeatured: query.isFeatured,
      isPopular: query.isPopular,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    };

    const [courses, total] = await Promise.all([
      this.courseRepo.findAll(filters),
      this.courseRepo.count(filters),
    ]);

    const categoryCache = new Map<string, CourseCategoryResult | null>();

    const items = await Promise.all(
      courses.map(async (course) => {
        const branchEntities = await Promise.all(
          course.branchIds.map(async (branchId) => {
            const branch =
              await this.branchRepo.findById(branchId);

            if (!branch) {
              throw new BranchNotFoundException(
                branchId,
              );
            }

            return branch;
          }),
        );

        const branches = branchEntities.map(
          (branch) =>
            new CourseBranchResult(
              branch.id,
              branch.branchName.getValue(),
              branch.branchCode.getValue(),
            ),
        );

        let category = categoryCache.get(course.categoryId);

        if (category === undefined) {
          const categoryEntity = await this.categoryRepo.findById(
            course.categoryId,
          );
          category = categoryEntity
            ? new CourseCategoryResult(
                categoryEntity.id,
                categoryEntity.name.getValue(),
              )
            : null;
          categoryCache.set(course.categoryId, category);
        }

        return GetCourseResult.fromEntity(course, branches, {
          category,
          categoryName: category?.name ?? null,
        });
      }),
    );

    return new ListCoursesResult(items, total);
  }
}
