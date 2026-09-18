import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { StudentStatus } from '@modules/student/domain/enums/student-status.enum';
import { ResolveAuthenticatedStudentService } from '@modules/student/domain/services/resolve-authenticated-student.service';

import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';

import { GetMyEnrollmentQuery } from './get-my-enrollment.query';

export class GetMyEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
  ) {}

  async execute(
    query: GetMyEnrollmentQuery,
  ): Promise<GetEnrollmentResult[]> {
    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        query.userId,
      );

    if (!student) {
      return [];
    }

    if (student.status !== StudentStatus.ADMITTED) {
      throw new BaseException(
        ERROR_CODES.PERMISSION_DENIED,
        'My Enrollment is available only for admitted students.',
        403,
      );
    }

    return this.enrollmentRepo.findDetailsByStudentId(student.id);
  }
}
