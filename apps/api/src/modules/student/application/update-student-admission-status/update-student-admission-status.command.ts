import { StudentStatus } from '../../domain/enums/student-status.enum';

export class UpdateStudentAdmissionStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: StudentStatus,
    public readonly updatedBy?: string | null,
    public readonly actorBranchId?: string,
  ) {}
}
