import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { PaymentAccessDeniedException } from '../../domain/errors/payment-business.exception';
import { InvalidPaymentSignatureException } from '../../domain/errors/payment-business.exception';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { PaymentGatewayPort } from '../../domain/services/payment-gateway.port';
import { PaymentDomainService } from '../../domain/services/payment-domain.service';
import { PaymentEnrollmentSyncService } from '../shared/payment-enrollment-sync.service';
import { GetPaymentResult } from '../get-payment/get-payment.result';

import { VerifyPaymentCommand } from './verify-payment.command';

export class VerifyPaymentHandler {
  private readonly logger = new Logger(
    VerifyPaymentHandler.name,
  );

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly gateway: PaymentGatewayPort,
    private readonly domainService: PaymentDomainService,
    private readonly enrollmentSync: PaymentEnrollmentSyncService,
  ) {}

  async execute(
    command: VerifyPaymentCommand,
  ): Promise<GetPaymentResult> {
    const student = await this.studentRepo.findByCreatedBy(
      command.userId,
    );

    if (!student) {
      throw new BaseException(
        ERROR_CODES.STUDENT_NOT_FOUND,
        'Student profile not found.',
        404,
      );
    }

    const payment = this.domainService.ensureExists(
      await this.paymentRepo.findByGatewayOrderId(
        command.razorpayOrderId,
        true,
      ),
    );

    this.domainService.ensureStudentOwnership(payment, student.id);

    if (payment.enrollmentId !== command.enrollmentId) {
      throw new PaymentAccessDeniedException();
    }

    // Idempotent: a payment already captured is simply returned as-is.
    if (payment.isSuccessful()) {
      return this.domainService.ensureDetailExists(
        await this.paymentRepo.findDetailById(payment.id, true),
      );
    }

    const isValid = this.gateway.verifyPaymentSignature({
      orderId: command.razorpayOrderId,
      paymentId: command.razorpayPaymentId,
      signature: command.razorpaySignature,
    });

    if (!isValid) {
      throw new InvalidPaymentSignatureException();
    }

    payment.markSuccess({
      gatewayPaymentId: command.razorpayPaymentId,
      gatewaySignature: command.razorpaySignature,
      paidAt: new Date(),
      updatedBy: command.userId,
    });

    await this.paymentRepo.save(payment);

    await this.enrollmentSync.applyPaymentSuccess(payment);

    this.logger.log(
      `✅ Payment verified and captured: ${payment.id}`,
    );

    return this.domainService.ensureDetailExists(
      await this.paymentRepo.findDetailById(payment.id, true),
    );
  }
}
