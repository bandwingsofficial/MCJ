import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { PermanentDeleteEnrollmentCommand } from './permanent-delete-enrollment.command';
import { PermanentDeleteEnrollmentResult } from './permanent-delete-enrollment.result';

export class PermanentDeleteEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
  ) {}

  async execute(
    command: PermanentDeleteEnrollmentCommand,
  ): Promise<PermanentDeleteEnrollmentResult> {
    const enrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(command.id, true),
    );

    this.domainService.ensureEligibleForPermanentDelete(enrollment);

    const studentId = enrollment.studentId;

    if (!enrollment.isDeleted && enrollment.occupiesSeat()) {
      await this.sideEffects.releaseSeat(enrollment);
    }

    await this.enrollmentRepo.deletePermanent(enrollment.id);

    await this.sideEffects.syncStudentStatusForStudentId(studentId);

    return new PermanentDeleteEnrollmentResult(
      enrollment.id,
      true,
    );
  }
}
