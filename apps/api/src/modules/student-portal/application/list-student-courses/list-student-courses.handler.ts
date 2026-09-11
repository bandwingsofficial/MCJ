import { isValidLearningEnrollmentStatus } from '@modules/enrollment/domain/learning-enrollment-access';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';

import { CourseAccessService } from '../../domain/services/course-access.service';

import { ListStudentCoursesQuery } from './list-student-courses.query';
import { StudentCourseSummaryResult } from '../student-course/student-course.result';

export class ListStudentCoursesHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async execute(
    query: ListStudentCoursesQuery,
  ): Promise<StudentCourseSummaryResult[]> {
    const student =
      await this.courseAccessService.resolveStudentFromUserId(
        query.userId,
      );

    const enrollments =
      await this.enrollmentRepo.findDetailsByStudentId(student.id);

    return enrollments
      .filter((enrollment) =>
        isValidLearningEnrollmentStatus(enrollment.status),
      )
      .map(
        (enrollment) =>
          new StudentCourseSummaryResult(
            enrollment.course.id,
            enrollment.course.title,
            enrollment.course.slug,
            enrollment.course.thumbnailUrl,
            enrollment.course.level,
            enrollment.course.language,
            enrollment.id,
            enrollment.enrollmentNumber,
            enrollment.status,
            enrollment.batch.id,
            enrollment.batch.name,
          ),
      );
  }
}
