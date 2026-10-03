import type { StudentAdmittedEnrollmentBlock } from '../../domain/repositories/student.repository';

export class GetStudentAdmittedEnrollmentBlocksResult {
  constructor(public readonly blocks: StudentAdmittedEnrollmentBlock[]) {}
}
