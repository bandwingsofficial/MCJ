import type { StudentRepository } from '../../domain/repositories/student.repository';
import { formatStudentCode } from '../../domain/utils/student-code.util';

import { SuggestStudentCodeQuery } from './suggest-student-code.query';
import { SuggestStudentCodeResult } from './suggest-student-code.result';

export class SuggestStudentCodeHandler {
  constructor(private readonly studentRepo: StudentRepository) {}

  async execute(
    _query: SuggestStudentCodeQuery,
  ): Promise<SuggestStudentCodeResult> {
    const maxNumber = await this.studentRepo.getMaxStudentCodeNumber();
    const studentCode = formatStudentCode(maxNumber + 1);

    return new SuggestStudentCodeResult(studentCode);
  }
}
