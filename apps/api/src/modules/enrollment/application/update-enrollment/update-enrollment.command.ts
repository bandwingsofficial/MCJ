import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';

export class UpdateEnrollmentCommand {
  constructor(
    public readonly id: string,
    public readonly admissionDate?: Date,
    public readonly joiningDate?: Date,
    public readonly expectedCompletionDate?: Date,
    public readonly feeAmount?: number,
    public readonly discountAmount?: number,
    public readonly paidAmount?: number,
    public readonly remarks?: string,
    public readonly status?: EnrollmentStatus,
    public readonly isActive?: boolean,
    public readonly updatedBy?: string,
    public readonly actorBranchId?: string,
  ) {}
}
