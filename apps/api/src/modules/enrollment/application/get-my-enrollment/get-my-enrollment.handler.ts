import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';

import { GetMyEnrollmentQuery } from './get-my-enrollment.query';

export class GetMyEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly studentRepo: StudentRepository,
  ) {}

  async execute(
    query: GetMyEnrollmentQuery,
  ): Promise<GetEnrollmentResult[]> {
    const student = await this.studentRepo.findByCreatedBy(
      query.userId,
    );

    if (!student) {
      return [];
    }

    return this.enrollmentRepo.findDetailsByStudentId(student.id);
  }
}
