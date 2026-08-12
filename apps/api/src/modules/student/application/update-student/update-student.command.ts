import { StudentGender } from '../../domain/enums/student-gender.enum';
import { StudentStatus } from '../../domain/enums/student-status.enum';

export class UpdateStudentCommand {
  constructor(
    public readonly id: string,
    public readonly firstName?: string,
    public readonly lastName?: string | null,
    public readonly email?: string | null,
    public readonly phone?: string | null,
    public readonly gender?: StudentGender | null,
    public readonly dateOfBirth?: Date | null,
    public readonly addressLine1?: string | null,
    public readonly addressLine2?: string | null,
    public readonly city?: string | null,
    public readonly state?: string | null,
    public readonly country?: string | null,
    public readonly postalCode?: string | null,
    public readonly profileImageFileId?: string | null,
    public readonly qualification?: string | null,
    public readonly collegeName?: string | null,
    public readonly specialization?: string | null,
    public readonly passingYear?: number | null,
    public readonly parentName?: string | null,
    public readonly parentPhone?: string | null,
    public readonly emergencyContactName?: string | null,
    public readonly emergencyContactPhone?: string | null,
    public readonly studentCode?: string,
    public readonly admissionDate?: Date | null,
    public readonly branchId?: string,
    public readonly notes?: string | null,
    public readonly status?: StudentStatus,
    public readonly updatedBy?: string,
    public readonly actorBranchId?: string,
  ) {}
}