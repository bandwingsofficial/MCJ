import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { CourseHierarchyService } from '@modules/course/infrastructure/services/course-hierarchy.service';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import { CourseDomainService } from '@modules/course/domain/services/course-domain.service';
import { GetCourseResult } from '@modules/course/application/get-course/get-course.result';
import { BranchNotFoundException } from '@modules/branch/domain/errors/branch-not-found.exception';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { CourseBranchResult } from '@modules/course/application/get-course/get-course.result';
import type { LessonProgressRepository } from '../../domain/repositories/lesson-progress.repository';

import { CourseAccessService } from '../../domain/services/course-access.service';
import {
  StudentCourseProgressItemResult,
  StudentCourseProgressResult,
} from '../student-course/student-course.result';
import { GetStudentCourseQuery } from './get-student-course.query';

export class GetStudentCourseHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly courseRepo: CourseRepository,
    private readonly courseDomainService: CourseDomainService,
    private readonly branchRepo: BranchRepository,
    private readonly hierarchyService: CourseHierarchyService,
    private readonly lessonProgressRepo: LessonProgressRepository,
  ) {}

  async execute(query: GetStudentCourseQuery): Promise<{
    course: GetCourseResult;
    progress: StudentCourseProgressResult;
  }> {
    await this.courseAccessService.requireAdmittedEnrollment(
      query.userId,
      query.courseId,
    );

    const course = await this.courseDomainService.ensureExists(
      await this.courseRepo.findById(query.courseId),
    );

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

    const modules = await this.hierarchyService.getTree(course.id);
    const counts = await this.hierarchyService.getCourseCounts(course.id);
    const student =
      await this.courseAccessService.resolveStudentFromUserId(
        query.userId,
      );
    const progressRecords =
      await this.lessonProgressRepo.findByStudentAndCourse(
        student.id,
        course.id,
      );
    const completedLessons = progressRecords.filter(
      (item) => item.isCompleted,
    ).length;
    const completionPercentage = counts.lessonCount
      ? Math.round((completedLessons / counts.lessonCount) * 100)
      : 0;

    return {
      course: GetCourseResult.fromEntity(course, branches, {
        modules,
        previewModules: [],
        moduleCount: counts.moduleCount,
        lessonCount: counts.lessonCount,
        previewLessonCount: counts.previewLessonCount,
        isEnrolled: true,
        isAdmitted: true,
        publicView: false,
      }),
      progress: new StudentCourseProgressResult(
        course.id,
        counts.lessonCount,
        completedLessons,
        completionPercentage,
        progressRecords.map(
          (item) =>
            new StudentCourseProgressItemResult(
              item.lessonId,
              item.isCompleted,
              item.watchedSeconds,
              item.completedAt,
            ),
        ),
      ),
    };
  }
}

export class GetStudentCourseModuleHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(query: {
    userId: string;
    courseId: string;
    moduleId: string;
  }) {
    await this.courseAccessService.requireAdmittedEnrollment(
      query.userId,
      query.courseId,
    );

    const module = await this.hierarchyService.getModuleTree(
      query.courseId,
      query.moduleId,
    );

    if (!module) {
      throw new BaseException(
        ERROR_CODES.COURSE_MODULE_NOT_FOUND,
        'Course module not found',
        404,
      );
    }

    return module;
  }
}

export class GetStudentCourseLessonHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly hierarchyService: CourseHierarchyService,
    private readonly lessonProgressRepo: LessonProgressRepository,
  ) {}

  async execute(query: {
    userId: string;
    courseId: string;
    lessonId: string;
  }) {
    await this.courseAccessService.requireAdmittedEnrollment(
      query.userId,
      query.courseId,
    );

    const lesson = await this.hierarchyService.getLessonTree(
      query.courseId,
      query.lessonId,
    );

    if (!lesson) {
      throw new BaseException(
        ERROR_CODES.COURSE_LESSON_NOT_FOUND,
        'Course lesson not found',
        404,
      );
    }

    const student =
      await this.courseAccessService.resolveStudentFromUserId(
        query.userId,
      );
    const progress =
      await this.lessonProgressRepo.findByStudentAndLesson(
        student.id,
        lesson.id,
      );

    return {
      lesson,
      progress: progress
        ? {
            isCompleted: progress.isCompleted,
            watchedSeconds: progress.watchedSeconds,
            completedAt: progress.completedAt,
          }
        : null,
    };
  }
}
