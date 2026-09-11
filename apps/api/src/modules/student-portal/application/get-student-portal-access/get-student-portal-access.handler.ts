import { Logger } from '@nestjs/common';

import { isValidLearningEnrollmentStatus } from '@modules/enrollment/domain/learning-enrollment-access';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';
import { StudentStatus } from '@modules/student/domain/enums/student-status.enum';
import { ResolveAuthenticatedStudentService } from '@modules/student/domain/services/resolve-authenticated-student.service';

import {
  StudentPortalEnrollmentNotAdmittedException,
  StudentPortalEnrollmentNotFoundException,
  StudentPortalStudentNotAdmittedException,
  StudentPortalStudentNotFoundException,
} from '../../domain/errors/student-portal-business.exception';
import { StudentPortalResponseMapper } from '../mappers/student-portal-response.mapper';

import { GetStudentPortalAccessQuery } from './get-student-portal-access.query';
import { StudentPortalAccessResult } from './get-student-portal-access.result';

export class GetStudentPortalAccessHandler {
  private readonly logger = new Logger(
    GetStudentPortalAccessHandler.name,
  );

  constructor(
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async execute(
    query: GetStudentPortalAccessQuery,
  ): Promise<StudentPortalAccessResult> {
    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        query.userId,
        query.email,
      );

    if (!student) {
      throw new StudentPortalStudentNotFoundException();
    }

    const enrollments =
      await this.enrollmentRepo.findDetailsByStudentId(student.id);

    if (!enrollments.length) {
      throw new StudentPortalEnrollmentNotFoundException();
    }

    if (student.status !== StudentStatus.ADMITTED) {
      throw new StudentPortalStudentNotAdmittedException();
    }

    const enrollment =
      enrollments.find((item) =>
        isValidLearningEnrollmentStatus(item.status),
      ) ?? enrollments[0];

    if (!isValidLearningEnrollmentStatus(enrollment.status)) {
      throw new StudentPortalEnrollmentNotAdmittedException();
    }

    this.logger.log(
      `✅ Student portal access granted: ${student.id}`,
    );

    return StudentPortalResponseMapper.toAccessResult(enrollment);
  }
}
