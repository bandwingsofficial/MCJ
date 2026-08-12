import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';

export class UpdateEnrollmentStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: EnrollmentStatus,
    public readonly updatedBy?: string,
    public readonly actorBranchId?: string,
  ) {}
}
