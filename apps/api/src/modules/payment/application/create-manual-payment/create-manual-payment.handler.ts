import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';

import { Payment } from '../../domain/entities/payment.entity';
import { PaymentGateway } from '../../domain/enums/payment-gateway.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import {
  EnrollmentAlreadyPaidException,
  PaymentAmountExceedsDueException,
} from '../../domain/errors/payment-business.exception';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentDomainService } from '../../domain/services/payment-domain.service';
import { PaymentEnrollmentSyncService } from '../shared/payment-enrollment-sync.service';
import { GetPaymentResult } from '../get-payment/get-payment.result';

import { CreateManualPaymentCommand } from './create-manual-payment.command';

export class CreateManualPaymentHandler {
  private readonly logger = new Logger(
    CreateManualPaymentHandler.name,
  );

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: PaymentDomainService,
    private readonly enrollmentSync: PaymentEnrollmentSyncService,
  ) {}

  async execute(
    command: CreateManualPaymentCommand,
  ): Promise<GetPaymentResult> {
    const enrollment = await this.enrollmentRepo.findDetailById(
      command.enrollmentId,
      true,
    );

    if (!enrollment || enrollment.isDeleted) {
      throw new BaseException(
        ERROR_CODES.ENROLLMENT_NOT_FOUND,
        'Enrollment not found.',
        404,
      );
    }

    const dueAmount = enrollment.dueAmount;

    if (dueAmount <= 0) {
      throw new EnrollmentAlreadyPaidException();
    }

    if (command.amount > dueAmount) {
      throw new PaymentAmountExceedsDueException();
    }

    const currency =
      command.currency || enrollment.course.pricing.currency || 'INR';

    const paymentNumber =
      await this.domainService.generateUniquePaymentNumber(
        this.paymentRepo,
      );

    const payment = Payment.create({
      id: randomUUID(),
      paymentNumber,
      enrollmentId: enrollment.id,
      studentId: enrollment.student.id,
      amount: command.amount,
      currency,
      paymentMethod: command.paymentMethod,
      paymentStatus: PaymentStatus.SUCCESS,
      gateway: PaymentGateway.MANUAL,
      transactionId: command.transactionId,
      remarks: command.remarks,
      paidAt: command.paidAt ?? new Date(),
      createdBy: command.createdBy,
    });

    await this.paymentRepo.save(payment);

    await this.enrollmentSync.applyPaymentSuccess(payment);

    this.logger.log(
      `✅ Manual payment recorded: ${payment.id} (${command.paymentMethod})`,
    );

    return this.domainService.ensureDetailExists(
      await this.paymentRepo.findDetailById(payment.id, true),
    );
  }
}
