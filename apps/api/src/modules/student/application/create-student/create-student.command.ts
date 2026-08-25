import { StudentGender } from '../../domain/enums/student-gender.enum';
import { StudentStatus } from '../../domain/enums/student-status.enum';

export class CreateStudentCommand {
  constructor(
    public readonly firstName: string,
    public readonly branchId?: string,
    public readonly lastName?: string,
    public readonly email?: string,
    public readonly phone?: string,
    public readonly gender?: StudentGender,
    public readonly dateOfBirth?: Date,
    public readonly addressLine1?: string,
    public readonly addressLine2?: string,
    public readonly city?: string,
    public readonly state?: string,
    public readonly country?: string,
    public readonly postalCode?: string,
    public readonly profileImageFileId?: string,
    public readonly qualification?: string,
    public readonly collegeName?: string,
    public readonly specialization?: string,
    public readonly passingYear?: number,
    public readonly parentName?: string,
    public readonly parentPhone?: string,
    public readonly emergencyContactName?: string,
    public readonly emergencyContactPhone?: string,
    public readonly admissionDate?: Date,
    public readonly notes?: string,
    public readonly status?: StudentStatus,
    public readonly userId?: string,
    public readonly createdBy?: string,
  ) {}
}
