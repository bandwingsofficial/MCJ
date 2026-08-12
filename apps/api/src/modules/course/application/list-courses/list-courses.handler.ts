import type { CourseRepository } from '../../domain/repositories/course.repository';
import {
  GetCourseResult,
  CourseBranchResult,
} from '../get-course/get-course.result';

import { ListCoursesQuery } from './list-courses.query';

import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/branch/domain/errors/branch-not-found.exception';

export class ListCoursesHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    query: ListCoursesQuery,
  ): Promise<GetCourseResult[]> {
    const courses = await this.courseRepo.findAll({
      categoryId: query.categoryId,
      branchId: query.branchId,
      status: query.status,
      search: query.search,
      isFeatured: query.isFeatured,
      isPopular: query.isPopular,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    });

    return Promise.all(
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

        return GetCourseResult.fromEntity(
          course,
          branches,
        );
      }),
    );
  }
}