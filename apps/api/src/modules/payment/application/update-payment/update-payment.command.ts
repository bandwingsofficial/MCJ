import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class UpdatePaymentCommand {
  constructor(
    public readonly id: string,
    public readonly remarks?: string,
    public readonly transactionId?: string,
    public readonly status?: PaymentStatus,
    public readonly updatedBy?: string,
  ) {}
}
