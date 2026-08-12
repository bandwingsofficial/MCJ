import { Logger } from '@nestjs/common';

import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';
import { StudentStatus } from '@modules/student/domain/enums/student-status.enum';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

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
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async execute(
    query: GetStudentPortalAccessQuery,
  ): Promise<StudentPortalAccessResult> {
    // Step 1 — resolve the student profile from the authenticated user.
    const student = await this.studentRepo.findByUserId(
      query.userId,
    );

    if (!student) {
      throw new StudentPortalStudentNotFoundException();
    }

    // Step 2 — the student must have at least one enrollment.
    const enrollments =
      await this.enrollmentRepo.findDetailsByStudentId(student.id);

    if (!enrollments.length) {
      throw new StudentPortalEnrollmentNotFoundException();
    }

    // Step 3 — portal access depends only on academic admission state.
    // Payment/financial status must never block access.
    if (student.status !== StudentStatus.ADMITTED) {
      throw new StudentPortalStudentNotAdmittedException();
    }

    const enrollment =
      enrollments.find(
        (item) => item.status === EnrollmentStatus.ADMITTED,
      ) ?? enrollments[0];

    if (enrollment.status !== EnrollmentStatus.ADMITTED) {
      throw new StudentPortalEnrollmentNotAdmittedException();
    }

    this.logger.log(
      `✅ Student portal access granted: ${student.id}`,
    );

    return StudentPortalResponseMapper.toAccessResult(enrollment);
  }
}
