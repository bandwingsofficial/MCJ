import { Logger } from '@nestjs/common';

import { EnrollmentSideEffectsService } from '@modules/enrollment/application/shared/enrollment-side-effects.service';
import { ApplicationType } from '@modules/enrollment/domain/enums/application-type.enum';
import { EnrollmentSource } from '@modules/enrollment/domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';
import { ApplicationType as StudentApplicationType } from '@modules/student/domain/enums/application-type.enum';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { Payment } from '../../domain/entities/payment.entity';
import { PaymentStatus as EnrollmentPaymentStatus } from '@modules/enrollment/domain/enums/payment-status.enum';

const round = (value: number) => Math.round(value * 100) / 100;

// Propagates successful/refunded payments onto the owning Enrollment aggregate:
// updates paidAmount/dueAmount and auto-admits paid public/online enrollments.
export class PaymentEnrollmentSyncService {
  private readonly logger = new Logger(
    PaymentEnrollmentSyncService.name,
  );

  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly sideEffects: EnrollmentSideEffectsService,
    private readonly studentRepo: StudentRepository,
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

    // Idempotent retry: already fully paid and admitted.
    if (
      enrollment.paymentStatus === EnrollmentPaymentStatus.PAID &&
      (enrollment.status === EnrollmentStatus.ADMITTED ||
        enrollment.status === EnrollmentStatus.ACTIVE)
    ) {
      return;
    }

    const previousStatus = enrollment.status;

    const aggregatedPaid = round(
      enrollment.paidAmount + payment.amount,
    );

    const newPaid = Math.min(aggregatedPaid, enrollment.finalAmount);
    const willBeFullyPaid = newPaid >= enrollment.finalAmount;

    const isOnlinePublicFlow =
      enrollment.source !== EnrollmentSource.ADMIN ||
      enrollment.applicationType === ApplicationType.ONLINE;

    let status: EnrollmentStatus | undefined;
    let admissionDate: Date | undefined;
    let isActive: boolean | undefined;

    if (
      isOnlinePublicFlow &&
      willBeFullyPaid &&
      (previousStatus === EnrollmentStatus.PENDING ||
        previousStatus === EnrollmentStatus.PENDING_APPROVAL)
    ) {
      status = EnrollmentStatus.ADMITTED;
      admissionDate = new Date();
      isActive = true;
    }

    enrollment.update({
      paidAmount: newPaid,
      admissionDate,
      status,
      isActive,
      applicationType:
        isOnlinePublicFlow && willBeFullyPaid
          ? ApplicationType.ONLINE
          : undefined,
      updatedBy: payment.createdBy,
    });

    if (status === EnrollmentStatus.ADMITTED) {
      await this.sideEffects.assertCapacityForTransition(
        enrollment,
        previousStatus,
      );
    }

    await this.enrollmentRepo.save(enrollment);

    if (status === EnrollmentStatus.ADMITTED) {
      await this.sideEffects.apply(
        enrollment,
        previousStatus,
        payment.createdBy,
      );

      const student = await this.studentRepo.findById(
        enrollment.studentId,
      );
      if (
        student &&
        student.applicationType !== StudentApplicationType.ONLINE
      ) {
        student.update({
          applicationType: StudentApplicationType.ONLINE,
          updatedBy: payment.createdBy,
        });
        await this.studentRepo.save(student);
      }
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
