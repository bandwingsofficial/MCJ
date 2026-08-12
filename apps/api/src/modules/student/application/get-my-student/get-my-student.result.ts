import type { Student } from '../../domain/entities/student.entity';
import { StudentGender } from '../../domain/enums/student-gender.enum';
import { StudentStatus } from '../../domain/enums/student-status.enum';

export class GetMyStudentResult {
  constructor(
    public readonly studentCode: string,
    public readonly firstName: string,
    public readonly lastName: string | null,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly gender: StudentGender | null,
    public readonly dateOfBirth: Date | null,
    public readonly addressLine1: string | null,
    public readonly addressLine2: string | null,
    public readonly city: string | null,
    public readonly state: string | null,
    public readonly country: string | null,
    public readonly postalCode: string | null,
    public readonly profileImageUrl: string | null,
    public readonly qualification: string | null,
    public readonly collegeName: string | null,
    public readonly specialization: string | null,
    public readonly passingYear: number | null,
    public readonly parentName: string | null,
    public readonly parentPhone: string | null,
    public readonly emergencyContactName: string | null,
    public readonly emergencyContactPhone: string | null,
    public readonly notes: string | null,
    public readonly status: StudentStatus,
    public readonly isActive: boolean,
  ) {}

  static fromStudent(student: Student): GetMyStudentResult {
    return new GetMyStudentResult(
      student.studentCode.getValue(),
      student.firstName.getValue(),
      student.lastName?.getValue() ?? null,
      student.email.getValue(),
      student.phone.getValue(),
      student.gender,
      student.dateOfBirth,
      student.address.addressLine1,
      student.address.addressLine2,
      student.address.city,
      student.address.state,
      student.address.country,
      student.address.postalCode,
      student.profileImageUrl,
      student.qualification.getValue(),
      student.collegeName,
      student.specialization,
      student.passingYear,
      student.parentName?.getValue() ?? null,
      student.parentPhone.getValue(),
      student.emergencyContactName?.getValue() ?? null,
      student.emergencyContactPhone.getValue(),
      student.notes,
      student.status,
      student.isActive,
    );
  }
}
