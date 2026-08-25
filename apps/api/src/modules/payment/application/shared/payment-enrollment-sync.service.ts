import { Logger } from '@nestjs/common';

import { EnrollmentSource } from '@modules/enrollment/domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';

import { Payment } from '../../domain/entities/payment.entity';

const round = (value: number) => Math.round(value * 100) / 100;

// Propagates successful/refunded payments onto the owning Enrollment aggregate:
// updates paidAmount/dueAmount and moves paid enrollments into PENDING_APPROVAL.
export class PaymentEnrollmentSyncService {
  private readonly logger = new Logger(
    PaymentEnrollmentSyncService.name,
  );

  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
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

    // Online/public enrollments move to approval after full payment.
    // Admin branch enrollments stay active without a second approval step.
    if (
      enrollment.source !== EnrollmentSource.ADMIN &&
      willBeFullyPaid &&
      previousStatus === EnrollmentStatus.PENDING
    ) {
      status = EnrollmentStatus.PENDING_APPROVAL;
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
