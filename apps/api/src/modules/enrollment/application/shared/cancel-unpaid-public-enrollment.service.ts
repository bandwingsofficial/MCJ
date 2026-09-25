import { Inject, Injectable, Logger } from '@nestjs/common';

import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { ENROLLMENT_TOKENS } from '../../enrollment.tokens';
import { isUnpaidPublicOnlineCheckoutEnrollment } from '../../domain/utils/public-enrollment-visibility.util';
import { EnrollmentCoinService } from './enrollment-coin.service';

@Injectable()
export class CancelUnpaidPublicEnrollmentService {
  private readonly logger = new Logger(
    CancelUnpaidPublicEnrollmentService.name,
  );

  constructor(
    @Inject(ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly enrollmentCoinService: EnrollmentCoinService,
  ) {}

  async cancelForStudent(
    studentId: string,
    updatedBy: string,
  ): Promise<void> {
    const enrollments =
      await this.enrollmentRepo.findDetailsByStudentId(studentId);

    for (const detail of enrollments) {
      if (
        !isUnpaidPublicOnlineCheckoutEnrollment({
          source: detail.source,
          applicationType: detail.applicationType,
          status: detail.status,
          finalAmount: detail.finalAmount,
          paidAmount: detail.paidAmount,
        })
      ) {
        continue;
      }

      const enrollment = await this.enrollmentRepo.findById(
        detail.id,
        true,
      );
      if (!enrollment) {
        continue;
      }

      if (enrollment.redeemedCoins > 0) {
        await this.enrollmentCoinService.releaseCoinsForEnrollment(
          enrollment,
        );
      }

      enrollment.update({
        status: EnrollmentStatus.CANCELLED,
        isActive: false,
        updatedBy,
      });

      await this.enrollmentRepo.save(enrollment);

      this.logger.log(
        `Cancelled unpaid public checkout enrollment ${enrollment.id}`,
      );
    }
  }
}
