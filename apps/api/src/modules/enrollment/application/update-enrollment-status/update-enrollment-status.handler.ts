import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { UpdateEnrollmentStatusCommand } from './update-enrollment-status.command';

export class UpdateEnrollmentStatusHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
  ) {}

  async execute(
    command: UpdateEnrollmentStatusCommand,
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

    this.domainService.ensureValidStatusTransition(
      previousStatus,
      command.status,
    );

    enrollment.changeStatus(command.status, command.updatedBy);

    await this.sideEffects.assertCapacityForTransition(
      enrollment,
      previousStatus,
    );

    await this.enrollmentRepo.save(enrollment);

    if (command.status !== previousStatus) {
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
