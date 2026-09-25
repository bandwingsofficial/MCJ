import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentCoinService } from '../shared/enrollment-coin.service';

import { ApplyEnrollmentCoinsCommand } from './apply-enrollment-coins.command';

export class ApplyEnrollmentCoinsHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly coinService: EnrollmentCoinService,
  ) {}

  async execute(
    command: ApplyEnrollmentCoinsCommand,
  ): Promise<GetEnrollmentResult> {
    await this.coinService.applyCoinsToEnrollment(
      command.userId,
      command.enrollmentId,
      command.coins,
    );

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(command.enrollmentId, true),
    );
  }
}
