import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { UpdateEnrollmentCommand } from './update-enrollment.command';

export class UpdateEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
  ) {}

  async execute(
    command: UpdateEnrollmentCommand,
  ): Promise<GetEnrollmentResult> {
    const enrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(enrollment);

    this.domainService.ensureBranchAccess(
      enrollment,
      command.actorBranchId,
    );

    const previousStatus = enrollment.status;

    if (command.status !== undefined) {
      this.domainService.ensureValidStatusTransition(
        previousStatus,
        command.status,
      );
    }

    enrollment.update({
      admissionDate: command.admissionDate,
      joiningDate: command.joiningDate,
      expectedCompletionDate: command.expectedCompletionDate,
      feeAmount: command.feeAmount,
      discountAmount: command.discountAmount,
      paidAmount: command.paidAmount,
      remarks: command.remarks,
      status: command.status,
      isActive: command.isActive,
      updatedBy: command.updatedBy,
    });

    await this.sideEffects.assertCapacityForTransition(
      enrollment,
      previousStatus,
    );

    await this.enrollmentRepo.save(enrollment);

    if (
      command.status !== undefined &&
      command.status !== previousStatus
    ) {
      await this.sideEffects.apply(
        enrollment,
        previousStatus,
        command.updatedBy,
      );
    }

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }
}
