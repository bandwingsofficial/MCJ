import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
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
      .filter(
        (enrollment) =>
          enrollment.status === EnrollmentStatus.ADMITTED,
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
