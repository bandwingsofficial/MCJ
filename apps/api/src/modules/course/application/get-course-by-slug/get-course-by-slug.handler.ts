import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { CourseStatus } from '../../domain/enums/course-status.enum';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';

import { BranchNotFoundException } from '@/modules/branch/domain/errors/branch-not-found.exception';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import {
  GetCourseResult,
  CourseBranchResult,
  CourseCategoryResult,
} from '../get-course/get-course.result';

import { GetCourseBySlugQuery } from './get-course-by-slug.query';

import { CourseHierarchyService } from '../../infrastructure/services/course-hierarchy.service';

export class GetCourseBySlugHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
    private readonly branchRepo: BranchRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly hierarchyService: CourseHierarchyService,
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async execute(
    query: GetCourseBySlugQuery,
  ): Promise<GetCourseResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findBySlug(
        query.slug,
        query.includeDeleted,
      ),
    );

    if (
      query.onlyActive &&
      course.status !== CourseStatus.ACTIVE
    ) {
      throw new BaseException(
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course not found',
        404,
      );
    }

    const branchEntities = await Promise.all(
      course.branchIds.map(async (branchId) => {
        const branch = await this.branchRepo.findById(branchId);

        if (!branch) {
          throw new BranchNotFoundException(branchId);
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

    const counts = await this.hierarchyService.getCourseCounts(
      course.id,
    );
    const previewModules =
      await this.hierarchyService.getPreviewTree(course.id);
    const modules = query.includeProtectedContent
      ? await this.hierarchyService.getTree(course.id)
      : [];
    const enrollmentFlags = await this.resolveEnrollmentFlags(
      query.userId,
      course.id,
    );

    const categoryEntity = await this.categoryRepo.findById(
      course.categoryId,
    );
    const category = categoryEntity
      ? new CourseCategoryResult(
          categoryEntity.id,
          categoryEntity.name.getValue(),
        )
      : null;

    return GetCourseResult.fromEntity(course, branches, {
      modules,
      previewModules,
      moduleCount: counts.moduleCount,
      lessonCount: counts.lessonCount,
      previewLessonCount: counts.previewLessonCount,
      isEnrolled: enrollmentFlags.isEnrolled,
      isAdmitted: enrollmentFlags.isAdmitted,
      publicView: !query.includeProtectedContent,
      category,
      categoryName: category?.name ?? null,
    });
  }

  private async resolveEnrollmentFlags(
    userId: string | undefined,
    courseId: string,
  ): Promise<{
    isEnrolled: boolean | null;
    isAdmitted: boolean | null;
  }> {
    if (!userId) {
      return { isEnrolled: null, isAdmitted: null };
    }

    const student = await this.studentRepo.findByUserId(userId);

    if (!student) {
      return { isEnrolled: false, isAdmitted: false };
    }

    const enrollments =
      await this.enrollmentRepo.findDetailsByStudentId(student.id);
    const courseEnrollments = enrollments.filter(
      (enrollment) => enrollment.course.id === courseId,
    );

    if (!courseEnrollments.length) {
      return { isEnrolled: false, isAdmitted: false };
    }

    return {
      isEnrolled: true,
      isAdmitted: courseEnrollments.some(
        (enrollment) =>
          enrollment.status === EnrollmentStatus.ADMITTED,
      ),
    };
  }
}
