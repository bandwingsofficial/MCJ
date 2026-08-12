import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class CreateManualPaymentCommand {
  constructor(
    public readonly enrollmentId: string,
    public readonly amount: number,
    public readonly paymentMethod: PaymentMethod,
    public readonly currency?: string,
    public readonly transactionId?: string,
    public readonly remarks?: string,
    public readonly paidAt?: Date,
    public readonly createdBy?: string,
  ) {}
}
