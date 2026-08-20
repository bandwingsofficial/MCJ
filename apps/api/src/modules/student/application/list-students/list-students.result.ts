import { GetStudentResult } from '../get-student/get-student.result';

export class ListStudentsResult {
  constructor(
    public readonly items: GetStudentResult[],
    public readonly count: number,
  ) {}
}
