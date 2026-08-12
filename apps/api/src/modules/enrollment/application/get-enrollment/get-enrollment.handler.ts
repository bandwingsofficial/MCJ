import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';

import { GetEnrollmentQuery } from './get-enrollment.query';
import { GetEnrollmentResult } from './get-enrollment.result';

export class GetEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
  ) {}

  async execute(
    query: GetEnrollmentQuery,
  ): Promise<GetEnrollmentResult> {
    const enrollment = this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(
        query.id,
        query.includeDeleted,
      ),
    );

    this.domainService.ensureBranchAccessById(
      enrollment.branch.id,
      query.branchId,
    );

    return enrollment;
  }
}
