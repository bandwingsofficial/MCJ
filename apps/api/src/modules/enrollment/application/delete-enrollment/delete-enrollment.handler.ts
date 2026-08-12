import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { DeleteEnrollmentCommand } from './delete-enrollment.command';
import { DeleteEnrollmentResult } from './delete-enrollment.result';

export class DeleteEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
  ) {}

  async execute(
    command: DeleteEnrollmentCommand,
  ): Promise<DeleteEnrollmentResult> {
    const enrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(enrollment);

    this.domainService.ensureBranchAccess(
      enrollment,
      command.actorBranchId,
    );

    await this.sideEffects.releaseSeat(
      enrollment,
      command.deletedBy,
    );

    enrollment.softDelete(command.deletedBy);
    await this.enrollmentRepo.save(enrollment);

    return new DeleteEnrollmentResult(
      enrollment.id,
      true,
      enrollment.deletedAt,
    );
  }
}
