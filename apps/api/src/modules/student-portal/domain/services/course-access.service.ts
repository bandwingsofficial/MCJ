import { isValidLearningEnrollmentStatus } from '@modules/enrollment/domain/learning-enrollment-access';
import type { EnrollmentDetailView } from '@modules/enrollment/domain/repositories/enrollment.repository';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';
import type { Student } from '@modules/student/domain/entities/student.entity';
import { StudentStatus } from '@modules/student/domain/enums/student-status.enum';
import { ResolveAuthenticatedStudentService } from '@modules/student/domain/services/resolve-authenticated-student.service';

import { CourseAccessDeniedException } from '../errors/course-access.exception';
import { StudentPortalStudentNotFoundException } from '../errors/student-portal-business.exception';

export class CourseAccessService {
  constructor(
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async resolveStudentFromUserId(userId: string): Promise<Student> {
    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        userId,
      );

    if (!student) {
      throw new StudentPortalStudentNotFoundException();
    }

    return student;
  }

  async getEnrollmentFlagsForCourse(
    userId: string | undefined,
    courseId: string,
  ): Promise<{
    isEnrolled: boolean | null;
    isAdmitted: boolean | null;
  }> {
    if (!userId) {
      return { isEnrolled: null, isAdmitted: null };
    }

    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        userId,
      );

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

    const admitted = courseEnrollments.some((enrollment) =>
      isValidLearningEnrollmentStatus(enrollment.status),
    );

    return {
      isEnrolled: admitted,
      isAdmitted:
        admitted && student.status === StudentStatus.ADMITTED,
    };
  }

  async requireAdmittedEnrollment(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentDetailView> {
    const student = await this.resolveStudentFromUserId(userId);

    if (student.status !== StudentStatus.ADMITTED) {
      throw new CourseAccessDeniedException();
    }

    const enrollment =
      await this.enrollmentRepo.findAdmittedByStudentAndCourse(
        student.id,
        courseId,
      );

    if (!enrollment) {
      throw new CourseAccessDeniedException();
    }

    return enrollment;
  }
}
