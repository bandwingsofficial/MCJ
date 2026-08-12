import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentDomainService } from '../../domain/services/payment-domain.service';

import { GetPaymentQuery } from './get-payment.query';
import { GetPaymentResult } from './get-payment.result';

export class GetPaymentHandler {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly domainService: PaymentDomainService,
  ) {}

  async execute(
    query: GetPaymentQuery,
  ): Promise<GetPaymentResult> {
    return this.domainService.ensureDetailExists(
      await this.paymentRepo.findDetailById(
        query.id,
        query.includeDeleted,
      ),
    );
  }
}
