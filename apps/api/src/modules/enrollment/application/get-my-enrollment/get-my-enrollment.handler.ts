import { ResolveAuthenticatedStudentService } from '@modules/student/domain/services/resolve-authenticated-student.service';

import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { shouldExposeEnrollmentInCustomerAndAdminLists } from '../../domain/utils/public-enrollment-visibility.util';
import { ApplicationType } from '../../domain/enums/application-type.enum';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
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

    const enrollments =
      await this.enrollmentRepo.findDetailsByStudentId(student.id);

    return enrollments.filter((enrollment) =>
      shouldExposeEnrollmentInCustomerAndAdminLists({
        source: enrollment.source as EnrollmentSource,
        applicationType: enrollment.applicationType as ApplicationType,
        status: enrollment.status as EnrollmentStatus,
        finalAmount: enrollment.finalAmount,
        paidAmount: enrollment.paidAmount,
        isDeleted: enrollment.isDeleted,
      }),
    );
  }
}
