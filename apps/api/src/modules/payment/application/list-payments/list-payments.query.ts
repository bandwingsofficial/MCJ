import { PaymentGateway } from '../../domain/enums/payment-gateway.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class ListPaymentsQuery {
  constructor(
    public readonly search?: string,
    public readonly enrollmentId?: string,
    public readonly studentId?: string,
    public readonly paymentStatus?: PaymentStatus,
    public readonly paymentMethod?: PaymentMethod,
    public readonly gateway?: PaymentGateway,
    public readonly includeDeleted?: boolean,
    public readonly createdAtFrom?: Date,
    public readonly createdAtTo?: Date,
    public readonly skip?: number,
    public readonly take?: number,
    public readonly sortBy?: string,
    public readonly sortOrder?: 'asc' | 'desc',
  ) {}
}
