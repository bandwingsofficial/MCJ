import { StudentGender } from '../../domain/enums/student-gender.enum';

export class CreateStudentByPublicCommand {
  constructor(
    public readonly createdBy: string,
    public readonly firstName?: string,
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
    public readonly qualification?: string,
    public readonly collegeName?: string,
    public readonly specialization?: string,
    public readonly passingYear?: number,
    public readonly parentName?: string,
    public readonly parentPhone?: string,
    public readonly emergencyContactName?: string,
    public readonly emergencyContactPhone?: string,
    public readonly notes?: string,
  ) {}
}
