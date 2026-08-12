import { Logger } from '@nestjs/common';

import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import {
  InvalidPaymentStatusTransitionException,
  PaymentNotRefundableException,
} from '../../domain/errors/payment-business.exception';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentDomainService } from '../../domain/services/payment-domain.service';
import { PaymentEnrollmentSyncService } from '../shared/payment-enrollment-sync.service';
import { GetPaymentResult } from '../get-payment/get-payment.result';

import { UpdatePaymentCommand } from './update-payment.command';

export class UpdatePaymentHandler {
  private readonly logger = new Logger(
    UpdatePaymentHandler.name,
  );

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly domainService: PaymentDomainService,
    private readonly enrollmentSync: PaymentEnrollmentSyncService,
  ) {}

  async execute(
    command: UpdatePaymentCommand,
  ): Promise<GetPaymentResult> {
    const payment = this.domainService.ensureExists(
      await this.paymentRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(payment);

    let refunded = false;

    // The only supported status change is a refund of a successful payment.
    if (
      command.status !== undefined &&
      command.status !== payment.paymentStatus
    ) {
      if (command.status !== PaymentStatus.REFUNDED) {
        throw new InvalidPaymentStatusTransitionException(
          payment.paymentStatus,
          command.status,
        );
      }

      if (!payment.isSuccessful()) {
        throw new PaymentNotRefundableException();
      }

      payment.markRefunded(command.updatedBy);
      refunded = true;
    }

    payment.update({
      remarks: command.remarks,
      transactionId: command.transactionId,
      updatedBy: command.updatedBy,
    });

    await this.paymentRepo.save(payment);

    if (refunded) {
      await this.enrollmentSync.applyRefund(payment);
      this.logger.log(`↩️ Payment refunded: ${payment.id}`);
    }

    return this.domainService.ensureDetailExists(
      await this.paymentRepo.findDetailById(payment.id, true),
    );
  }
}
