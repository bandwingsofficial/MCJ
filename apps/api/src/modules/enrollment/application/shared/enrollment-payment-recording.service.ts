import { randomUUID } from 'crypto';

import { Payment } from '@modules/payment/domain/entities/payment.entity';
import { PaymentGateway } from '@modules/payment/domain/enums/payment-gateway.enum';
import { PaymentMethod } from '@modules/payment/domain/enums/payment-method.enum';
import { PaymentStatus } from '@modules/payment/domain/enums/payment-status.enum';
import type { PaymentRepository } from '@modules/payment/domain/repositories/payment.repository';
import { PaymentDomainService } from '@modules/payment/domain/services/payment-domain.service';

import { PaymentEnrollmentSyncService } from '../../../payment/application/shared/payment-enrollment-sync.service';

export interface RecordEnrollmentPaymentParams {
  enrollmentId: string;
  studentId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  remarks?: string;
  paidAt?: Date;
  createdBy?: string;
}

export class EnrollmentPaymentRecordingService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly enrollmentSync: PaymentEnrollmentSyncService,
  ) {}

  async record(params: RecordEnrollmentPaymentParams): Promise<void> {
    if (params.amount <= 0) {
      return;
    }

    const paymentNumber =
      await this.paymentDomainService.generateUniquePaymentNumber(
        this.paymentRepo,
      );

    const paymentStatus = params.paymentStatus ?? PaymentStatus.SUCCESS;

    const payment = Payment.create({
      id: randomUUID(),
      paymentNumber,
      enrollmentId: params.enrollmentId,
      studentId: params.studentId,
      amount: params.amount,
      currency: params.currency,
      paymentMethod: params.paymentMethod,
      paymentStatus,
      gateway: PaymentGateway.MANUAL,
      transactionId: params.transactionId,
      remarks: params.remarks,
      paidAt:
        paymentStatus === PaymentStatus.SUCCESS
          ? params.paidAt ?? new Date()
          : params.paidAt ?? null,
      createdBy: params.createdBy,
    });

    await this.paymentRepo.save(payment);

    if (paymentStatus === PaymentStatus.SUCCESS) {
      await this.enrollmentSync.applyPaymentSuccess(payment);
    }
  }
}
