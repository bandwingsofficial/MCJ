import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import {
  GetCourseResult,
  CourseBranchResult,
} from '../get-course/get-course.result';

import { RestoreCourseCommand } from './restore-course.command';

import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/branch/domain/errors/branch-not-found.exception';

import { CourseHierarchyService } from '../../infrastructure/services/course-hierarchy.service';

export class RestoreCourseHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
    private readonly branchRepo: BranchRepository,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(
    command: RestoreCourseCommand,
  ): Promise<GetCourseResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(command.id, true),
    );

    course.restore(command.updatedBy);

    await this.courseRepo.save(course);

    await this.hierarchyService.restoreDescendants(course.id);

    const branchEntities = await Promise.all(
      course.branchIds.map(async (branchId) => {
        const branch = await this.branchRepo.findById(
          branchId,
        );

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
  }
}
