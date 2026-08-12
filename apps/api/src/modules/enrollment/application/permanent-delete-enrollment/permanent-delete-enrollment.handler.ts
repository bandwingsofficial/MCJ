import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';

import { PermanentDeleteEnrollmentCommand } from './permanent-delete-enrollment.command';
import { PermanentDeleteEnrollmentResult } from './permanent-delete-enrollment.result';

export class PermanentDeleteEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
  ) {}

  async execute(
    command: PermanentDeleteEnrollmentCommand,
  ): Promise<PermanentDeleteEnrollmentResult> {
    const enrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(enrollment);

    await this.enrollmentRepo.deletePermanent(enrollment.id);

    return new PermanentDeleteEnrollmentResult(
      enrollment.id,
      true,
    );
  }
}
