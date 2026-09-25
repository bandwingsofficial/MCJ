import { Logger } from '@nestjs/common';

import { EnrollmentCoinService } from '@modules/enrollment/application/shared/enrollment-coin.service';
import { EnrollmentSideEffectsService } from '@modules/enrollment/application/shared/enrollment-side-effects.service';
import { ApplicationType } from '@modules/enrollment/domain/enums/application-type.enum';
import { EnrollmentSource } from '@modules/enrollment/domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';
import {
  hasPaidPublicOnlineAdvance,
  isPublicOnlineAdvanceEnrollment,
  PUBLIC_ONLINE_ADVANCE_AMOUNT,
} from '@modules/enrollment/domain/utils/public-online-advance.util';
import { ApplicationType as StudentApplicationType } from '@modules/student/domain/enums/application-type.enum';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { Payment } from '../../domain/entities/payment.entity';
import { PaymentStatus as EnrollmentPaymentStatus } from '@modules/enrollment/domain/enums/payment-status.enum';

const round = (value: number) => Math.round(value * 100) / 100;

export class PaymentEnrollmentSyncService {
  private readonly logger = new Logger(
    PaymentEnrollmentSyncService.name,
  );

  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly sideEffects: EnrollmentSideEffectsService,
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentCoinService: EnrollmentCoinService,
  ) {}

  async applyPaymentSuccess(payment: Payment): Promise<void> {
    if (!payment.enrollmentId) {
      return;
    }

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

    const isAdvanceFlow = isPublicOnlineAdvanceEnrollment({
      source: enrollment.source,
      applicationType: enrollment.applicationType,
      finalAmount: enrollment.finalAmount,
    });

    if (
      isAdvanceFlow &&
      enrollment.status === EnrollmentStatus.ADVANCED &&
      hasPaidPublicOnlineAdvance(enrollment.paidAmount)
    ) {
      return;
    }

    if (
      !isAdvanceFlow &&
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
      enrollment.source === EnrollmentSource.PUBLIC ||
      enrollment.applicationType === ApplicationType.ONLINE;

    let status: EnrollmentStatus | undefined;
    let admissionDate: Date | undefined;
    let isActive: boolean | undefined;

    if (isAdvanceFlow) {
      if (
        newPaid >=
          Math.min(PUBLIC_ONLINE_ADVANCE_AMOUNT, enrollment.finalAmount) &&
        (previousStatus === EnrollmentStatus.PENDING ||
          previousStatus === EnrollmentStatus.PENDING_APPROVAL)
      ) {
        status = EnrollmentStatus.ADVANCED;
        isActive = false;
      }
    } else if (
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
        !isAdvanceFlow && isOnlinePublicFlow && willBeFullyPaid
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

    if (
      isAdvanceFlow &&
      status === EnrollmentStatus.ADVANCED &&
      enrollment.redeemedCoins > 0
    ) {
      await this.enrollmentCoinService.commitCoinsForEnrollment(enrollment);
    }

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
    } else if (status === EnrollmentStatus.ADVANCED) {
      await this.sideEffects.syncStudentStatusForStudentId(
        enrollment.studentId,
        payment.createdBy,
      );
    }
  }

  async applyRefund(payment: Payment): Promise<void> {
    if (!payment.enrollmentId) {
      return;
    }

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
