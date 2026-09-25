import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { ResolveAuthenticatedStudentService } from '@modules/student/domain/services/resolve-authenticated-student.service';

import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { shouldExposeEnrollmentInCustomerAndAdminLists } from '../../domain/utils/public-enrollment-visibility.util';
import { ApplicationType } from '../../domain/enums/application-type.enum';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';

import { GetMyEnrollmentByIdQuery } from './get-my-enrollment-by-id.query';

export class GetMyEnrollmentByIdHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
    private readonly domainService: EnrollmentDomainService,
  ) {}

  async execute(
    query: GetMyEnrollmentByIdQuery,
  ): Promise<GetEnrollmentResult> {
    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        query.userId,
      );

    if (!student) {
      throw new BaseException(
        ERROR_CODES.STUDENT_NOT_FOUND,
        'Student profile not found.',
        404,
      );
    }

    const enrollment = this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(
        query.enrollmentId,
        true,
      ),
    );

    if (enrollment.student.id !== student.id) {
      throw new BaseException(
        ERROR_CODES.ENROLLMENT_NOT_FOUND,
        'Enrollment not found.',
        404,
      );
    }

    if (
      !shouldExposeEnrollmentInCustomerAndAdminLists({
        source: enrollment.source as EnrollmentSource,
        applicationType: enrollment.applicationType as ApplicationType,
        status: enrollment.status as EnrollmentStatus,
        finalAmount: enrollment.finalAmount,
        paidAmount: enrollment.paidAmount,
        isDeleted: enrollment.isDeleted,
      })
    ) {
      throw new BaseException(
        ERROR_CODES.ENROLLMENT_NOT_FOUND,
        'Enrollment not found.',
        404,
      );
    }

    return enrollment;
  }
}
