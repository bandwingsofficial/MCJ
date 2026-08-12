import { Logger } from '@nestjs/common';

import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import { EnrollmentSideEffectsService } from '@modules/enrollment/application/shared/enrollment-side-effects.service';
import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';

import { Payment } from '../../domain/entities/payment.entity';

const round = (value: number) => Math.round(value * 100) / 100;

// Propagates successful/refunded payments onto the owning Enrollment aggregate:
// updates paidAmount/dueAmount, confirms admission on full payment, and reuses
// the Enrollment module's own side-effects (batch seats, student status).
export class PaymentEnrollmentSyncService {
  private readonly logger = new Logger(
    PaymentEnrollmentSyncService.name,
  );

  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly batchRepo: BatchRepository,
    private readonly enrollmentSideEffects: EnrollmentSideEffectsService,
  ) {}

  async applyPaymentSuccess(payment: Payment): Promise<void> {
    const enrollment = await this.enrollmentRepo.findById(
      payment.enrollmentId,
      true,
    );

    if (!enrollment) {
      this.logger.warn(
        `Enrollment ${payment.enrollmentId} not found while applying payment ${payment.id}`,
      );
      return;
    }

    const previousStatus = enrollment.status;

    const aggregatedPaid = round(
      enrollment.paidAmount + payment.amount,
    );

    // paidAmount can never exceed the agreed final amount on the enrollment.
    const newPaid = Math.min(
      aggregatedPaid,
      enrollment.finalAmount,
    );

    const willBeFullyPaid = newPaid >= enrollment.finalAmount;

    let admissionDate: Date | undefined;
    let joiningDate: Date | null | undefined;
    let expectedCompletionDate: Date | null | undefined;
    let status: EnrollmentStatus | undefined;

    // Admission is confirmed only on the transition to fully paid.
    if (
      willBeFullyPaid &&
      previousStatus === EnrollmentStatus.PENDING
    ) {
      const batch = await this.batchRepo.findById(
        enrollment.batchId,
        true,
      );

      admissionDate = new Date();
      joiningDate = batch?.startDate ?? enrollment.joiningDate;
      expectedCompletionDate =
        batch?.endDate ?? enrollment.expectedCompletionDate;
      status = EnrollmentStatus.ADMITTED;
    }

    enrollment.update({
      paidAmount: newPaid,
      admissionDate,
      joiningDate,
      expectedCompletionDate,
      status,
      updatedBy: payment.createdBy,
    });

    await this.enrollmentRepo.save(enrollment);

    if (
      status === EnrollmentStatus.ADMITTED &&
      previousStatus !== EnrollmentStatus.ADMITTED
    ) {
      this.logger.log(
    `Calling EnrollmentSideEffectsService for enrollment ${enrollment.id}`,
  );

      await this.enrollmentSideEffects.apply(
        enrollment,
        previousStatus,
        payment.createdBy,
      );
    }
  }

  async applyRefund(payment: Payment): Promise<void> {
    const enrollment = await this.enrollmentRepo.findById(
      payment.enrollmentId,
      true,
    );

    if (!enrollment) {
      return;
    }

    const newPaid = Math.max(
      0,
      round(enrollment.paidAmount - payment.amount),
    );

    enrollment.update({
      paidAmount: newPaid,
      updatedBy: payment.updatedBy ?? payment.createdBy,
    });

    await this.enrollmentRepo.save(enrollment);
  }
}
