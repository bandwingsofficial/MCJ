import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';

export class CreateEnrollmentCommand {
  constructor(
    public readonly studentId: string,
    public readonly batchId: string,
    public readonly feeAmount?: number,
    public readonly discountAmount?: number,
    public readonly paidAmount?: number,
    public readonly remarks?: string,
    public readonly source: EnrollmentSource = EnrollmentSource.ADMIN,
    public readonly createdBy?: string,
  ) {}
}
