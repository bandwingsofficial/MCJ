import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentCoinService } from '../shared/enrollment-coin.service';

import { RemoveEnrollmentCoinsCommand } from './remove-enrollment-coins.command';

export class RemoveEnrollmentCoinsHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly coinService: EnrollmentCoinService,
  ) {}

  async execute(
    command: RemoveEnrollmentCoinsCommand,
  ): Promise<GetEnrollmentResult> {
    await this.coinService.removeAppliedCoinsForUser(
      command.userId,
      command.enrollmentId,
    );

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(command.enrollmentId, true),
    );
  }
}
