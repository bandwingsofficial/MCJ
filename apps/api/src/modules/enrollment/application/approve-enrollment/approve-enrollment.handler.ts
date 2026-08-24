import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';

import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import {
  EnrollmentNotPendingApprovalException,
  EnrollmentPaymentNotVerifiedException,
} from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { ApproveEnrollmentCommand } from './approve-enrollment.command';

export class ApproveEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly batchRepo: BatchRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
  ) {}

  async execute(
    command: ApproveEnrollmentCommand,
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

    const isPaid =
      enrollment.paymentStatus === PaymentStatus.PAID ||
      enrollment.finalAmount <= 0;

    if (!isPaid) {
      throw new EnrollmentPaymentNotVerifiedException();
    }

    const previousStatus = enrollment.status;
    const batch = await this.batchRepo.findById(
      enrollment.batchId,
      true,
    );

    enrollment.update({
      status: EnrollmentStatus.ADMITTED,
      admissionDate: new Date(),
      joiningDate: batch?.startDate ?? enrollment.joiningDate,
      expectedCompletionDate:
        batch?.endDate ?? enrollment.expectedCompletionDate,
      isActive: true,
      updatedBy: command.updatedBy,
    });

    await this.sideEffects.assertCapacityForTransition(
      enrollment,
      previousStatus,
    );

    await this.enrollmentRepo.save(enrollment);

    await this.sideEffects.apply(
      enrollment,
      previousStatus,
      command.updatedBy,
    );

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }
}
