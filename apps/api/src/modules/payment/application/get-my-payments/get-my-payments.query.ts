import { PaymentGateway } from '../../domain/enums/payment-gateway.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class GetMyPaymentsQuery {
  constructor(
    public readonly userId: string,
    public readonly search?: string,
    public readonly enrollmentId?: string,
    public readonly paymentStatus?: PaymentStatus,
    public readonly paymentMethod?: PaymentMethod,
    public readonly gateway?: PaymentGateway,
    public readonly skip?: number,
    public readonly take?: number,
    public readonly sortBy?: string,
    public readonly sortOrder?: 'asc' | 'desc',
  ) {}
}
