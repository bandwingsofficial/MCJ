import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentDomainService } from '../../domain/services/payment-domain.service';
import { GetPaymentResult } from '../get-payment/get-payment.result';

import { GetMyPaymentQuery } from './get-my-payment.query';

export class GetMyPaymentHandler {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly domainService: PaymentDomainService,
  ) {}

  async execute(
    query: GetMyPaymentQuery,
  ): Promise<GetPaymentResult> {
    const student = await this.studentRepo.findByCreatedBy(
      query.userId,
    );

    if (!student) {
      throw new BaseException(
        ERROR_CODES.STUDENT_NOT_FOUND,
        'Student profile not found.',
        404,
      );
    }

    const payment = this.domainService.ensureDetailExists(
      await this.paymentRepo.findDetailById(query.id),
    );

    this.domainService.ensureStudentOwnershipById(
      payment.student.id,
      student.id,
    );

    return payment;
  }
}
