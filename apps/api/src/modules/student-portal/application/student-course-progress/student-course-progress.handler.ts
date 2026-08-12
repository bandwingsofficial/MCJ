import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { CourseHierarchyService } from '@modules/course/infrastructure/services/course-hierarchy.service';

import type { LessonProgressRepository } from '../../domain/repositories/lesson-progress.repository';
import { CourseAccessService } from '../../domain/services/course-access.service';
import {
  StudentCourseCompletionResult,
  StudentCourseProgressResult,
  StudentCourseProgressItemResult,
} from '../student-course/student-course.result';

export class GetStudentCourseProgressHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly hierarchyService: CourseHierarchyService,
    private readonly lessonProgressRepo: LessonProgressRepository,
  ) {}

  async execute(query: {
    userId: string;
    courseId: string;
  }): Promise<StudentCourseProgressResult> {
    await this.courseAccessService.requireAdmittedEnrollment(
      query.userId,
      query.courseId,
    );

    const student =
      await this.courseAccessService.resolveStudentFromUserId(
        query.userId,
      );
    const counts = await this.hierarchyService.getCourseCounts(
      query.courseId,
    );
    const progressRecords =
      await this.lessonProgressRepo.findByStudentAndCourse(
        student.id,
        query.courseId,
      );
    const completedLessons = progressRecords.filter(
      (item) => item.isCompleted,
    ).length;

    return new StudentCourseProgressResult(
      query.courseId,
      counts.lessonCount,
      completedLessons,
      counts.lessonCount
        ? Math.round((completedLessons / counts.lessonCount) * 100)
        : 0,
      progressRecords.map(
        (item) =>
          new StudentCourseProgressItemResult(
            item.lessonId,
            item.isCompleted,
            item.watchedSeconds,
            item.completedAt,
          ),
      ),
    );
  }
}

export class UpdateLessonProgressHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly hierarchyService: CourseHierarchyService,
    private readonly lessonProgressRepo: LessonProgressRepository,
  ) {}

  async execute(command: {
    userId: string;
    courseId: string;
    lessonId: string;
    isCompleted?: boolean;
    watchedSeconds?: number;
  }) {
    await this.courseAccessService.requireAdmittedEnrollment(
      command.userId,
      command.courseId,
    );

    const belongs = await this.hierarchyService.lessonBelongsToCourse(
      command.courseId,
      command.lessonId,
    );

    if (!belongs) {
      throw new BaseException(
        ERROR_CODES.COURSE_LESSON_NOT_FOUND,
        'Lesson does not belong to course',
        404,
      );
    }

    const student =
      await this.courseAccessService.resolveStudentFromUserId(
        command.userId,
      );

    return this.lessonProgressRepo.upsert({
      studentId: student.id,
      courseId: command.courseId,
      lessonId: command.lessonId,
      isCompleted: command.isCompleted,
      watchedSeconds: command.watchedSeconds,
    });
  }
}

export class GetStudentCourseCompletionHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly hierarchyService: CourseHierarchyService,
    private readonly lessonProgressRepo: LessonProgressRepository,
  ) {}

  async execute(query: {
    userId: string;
    courseId: string;
  }): Promise<StudentCourseCompletionResult> {
    await this.courseAccessService.requireAdmittedEnrollment(
      query.userId,
      query.courseId,
    );

    const student =
      await this.courseAccessService.resolveStudentFromUserId(
        query.userId,
      );
    const counts = await this.hierarchyService.getCourseCounts(
      query.courseId,
    );
    const progressRecords =
      await this.lessonProgressRepo.findByStudentAndCourse(
        student.id,
        query.courseId,
      );
    const completedLessons = progressRecords.filter(
      (item) => item.isCompleted,
    ).length;
    const completionPercentage = counts.lessonCount
      ? Math.round((completedLessons / counts.lessonCount) * 100)
      : 0;
    const isCourseCompleted =
      counts.lessonCount > 0 &&
      completedLessons === counts.lessonCount;

    return new StudentCourseCompletionResult(
      query.courseId,
      counts.lessonCount,
      completedLessons,
      completionPercentage,
      isCourseCompleted,
      isCourseCompleted,
    );
  }
}

export class DownloadStudentResourceHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(query: {
    userId: string;
    courseId: string;
    resourceId: string;
  }) {
    await this.courseAccessService.requireAdmittedEnrollment(
      query.userId,
      query.courseId,
    );

    const belongs =
      await this.hierarchyService.resourceBelongsToCourse(
        query.courseId,
        query.resourceId,
      );

    if (!belongs) {
      throw new BaseException(
        ERROR_CODES.COURSE_RESOURCE_NOT_FOUND,
        'Resource does not belong to course',
        404,
      );
    }

    const resource = await this.hierarchyService.getResource(
      query.resourceId,
    );

    if (!resource?.fileUrl) {
      throw new BaseException(
        ERROR_CODES.COURSE_RESOURCE_NOT_FOUND,
        'Resource file not found',
        404,
      );
    }

    return {
      resourceId: resource.id,
      title: resource.title,
      fileUrl: resource.fileUrl,
    };
  }
}
