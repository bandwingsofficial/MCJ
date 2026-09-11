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

    return this.enrollmentRepo.findDetailsByStudentId(student.id);
  }
}
