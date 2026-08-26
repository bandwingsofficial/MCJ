import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import type { CreateEnrollmentInstallmentDto } from '../../presentation/dtos/create-enrollment-installment.dto';
import type { PaymentMethod } from '@modules/payment/domain/enums/payment-method.enum';

export class CreateEnrollmentCommand {
  constructor(
    public readonly studentId: string,
    public readonly batchId: string,
    public readonly feeAmount: number,
    public readonly discountAmount: number = 0,
    public readonly admissionDate?: Date,
    public readonly initialPaymentAmount?: number,
    public readonly paymentMethod?: PaymentMethod,
    public readonly transactionId?: string,
    public readonly initialPaymentPaidAt?: Date,
    public readonly installments: CreateEnrollmentInstallmentDto[] = [],
    public readonly source: EnrollmentSource = EnrollmentSource.ADMIN,
    public readonly createdBy?: string,
    public readonly expectedBranchId?: string,
  ) {}
}
