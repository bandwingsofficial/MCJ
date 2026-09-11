import { StudentGender } from '@modules/student/domain/enums/student-gender.enum';

export class CreateJobApplicationWithStudentCommand {
  constructor(
    public readonly userId: string,
    public readonly slug: string,
    public readonly firstName: string,
    public readonly lastName: string | undefined,
    public readonly email: string,
    public readonly phone: string,
    public readonly gender: StudentGender,
    public readonly dateOfBirth: Date,
    public readonly addressLine1: string,
    public readonly addressLine2: string | undefined,
    public readonly city: string,
    public readonly state: string,
    public readonly country: string,
    public readonly postalCode: string,
    public readonly qualification: string,
    public readonly collegeName: string,
    public readonly specialization: string,
    public readonly passingYear: number,
    public readonly resume: Express.Multer.File,
  ) {}
}
