import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentNotPendingApprovalException } from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';

import { RejectEnrollmentCommand } from './reject-enrollment.command';

export class RejectEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
  ) {}

  async execute(
    command: RejectEnrollmentCommand,
  ): Promise<GetEnrollmentResult> {
    const enrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(enrollment);
    this.domainService.ensureBranchAccess(
      enrollment,
      command.actorBranchId,
    );

    if (enrollment.status !== EnrollmentStatus.PENDING_APPROVAL) {
      throw new EnrollmentNotPendingApprovalException();
    }

    enrollment.update({
      status: EnrollmentStatus.REJECTED,
      rejectionReason: command.reason.trim(),
      isActive: false,
      updatedBy: command.updatedBy,
    });

    await this.enrollmentRepo.save(enrollment);

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }
}
