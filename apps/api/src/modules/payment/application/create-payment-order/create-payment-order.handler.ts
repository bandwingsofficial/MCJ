import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { Payment } from '../../domain/entities/payment.entity';
import { PaymentGateway } from '../../domain/enums/payment-gateway.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { EnrollmentAlreadyPaidException } from '../../domain/errors/payment-business.exception';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { PaymentGatewayPort } from '../../domain/services/payment-gateway.port';
import { PaymentDomainService } from '../../domain/services/payment-domain.service';

import { CreatePaymentOrderCommand } from './create-payment-order.command';
import { CreatePaymentOrderResult } from './create-payment-order.result';

export class CreatePaymentOrderHandler {
  private readonly logger = new Logger(
    CreatePaymentOrderHandler.name,
  );

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly gateway: PaymentGatewayPort,
    private readonly domainService: PaymentDomainService,
  ) {}

  async execute(
    command: CreatePaymentOrderCommand,
  ): Promise<CreatePaymentOrderResult> {
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

    // Ownership: the enrollment must belong to the current student.
    this.domainService.ensureStudentOwnershipById(
      enrollment.student.id,
      student.id,
    );

    const dueAmount = enrollment.dueAmount;

    if (dueAmount <= 0) {
      throw new EnrollmentAlreadyPaidException();
    }

    const currency = enrollment.course.pricing.currency || 'INR';

    const order = await this.gateway.createOrder({
      amount: dueAmount,
      currency,
      receipt: enrollment.enrollmentNumber,
      notes: {
        enrollmentId: enrollment.id,
        studentId: student.id,
      },
    });

    const paymentNumber =
      await this.domainService.generateUniquePaymentNumber(
        this.paymentRepo,
      );

    const payment = Payment.create({
      id: randomUUID(),
      paymentNumber,
      enrollmentId: enrollment.id,
      studentId: student.id,
      amount: dueAmount,
      currency,
      paymentMethod: PaymentMethod.RAZORPAY,
      paymentStatus: PaymentStatus.PENDING,
      gateway: PaymentGateway.RAZORPAY,
      gatewayOrderId: order.orderId,
      createdBy: command.userId,
    });

    await this.paymentRepo.save(payment);

    this.logger.log(
      `✅ Razorpay order created for enrollment ${enrollment.id}: ${order.orderId}`,
    );

    return new CreatePaymentOrderResult(
      order.orderId,
      order.amount,
      order.currency,
      this.gateway.getPublicKey(),
      payment.id,
      paymentNumber,
    );
  }
}
