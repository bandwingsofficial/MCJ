import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { RestoreEnrollmentCommand } from './restore-enrollment.command';

export class RestoreEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
  ) {}

  async execute(
    command: RestoreEnrollmentCommand,
  ): Promise<GetEnrollmentResult> {
    const enrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(enrollment);

    this.domainService.ensureBranchAccess(
      enrollment,
      command.actorBranchId,
    );

    // A restored enrollment may re-claim a seat; reject if the batch is full.
    await this.sideEffects.assertCapacityForTransition(
      enrollment,
      null,
      { restore: true },
    );

    enrollment.restore(command.updatedBy);
    await this.enrollmentRepo.save(enrollment);

    // Re-occupy a seat if the restored enrollment still holds a place.
    await this.sideEffects.apply(
      enrollment,
      null,
      command.updatedBy,
    );

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }
}
