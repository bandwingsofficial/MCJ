import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class ListEnrollmentsQuery {
  constructor(
    public readonly search?: string,
    public readonly studentId?: string,
    public readonly branchId?: string,
    public readonly categoryId?: string,
    public readonly courseId?: string,
    public readonly batchId?: string,
    public readonly status?: EnrollmentStatus,
    public readonly paymentStatus?: PaymentStatus,
    public readonly source?: EnrollmentSource,
    public readonly isActive?: boolean,
    public readonly includeDeleted?: boolean,
    public readonly admissionDateFrom?: Date,
    public readonly admissionDateTo?: Date,
    public readonly createdAtFrom?: Date,
    public readonly createdAtTo?: Date,
    public readonly skip?: number,
    public readonly take?: number,
    public readonly sortBy?: string,
    public readonly sortOrder?: 'asc' | 'desc',
  ) {}
}
