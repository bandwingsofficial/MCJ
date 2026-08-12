import type { PaymentSummaryView } from '../../domain/repositories/payment.repository';

export class ListPaymentsResult {
  constructor(
    public readonly items: PaymentSummaryView[],
    public readonly total: number,
    public readonly skip: number,
    public readonly take: number,
  ) {}
}
