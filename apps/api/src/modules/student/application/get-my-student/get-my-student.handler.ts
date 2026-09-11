import { ResolveAuthenticatedStudentService } from '../../domain/services/resolve-authenticated-student.service';

import { GetMyStudentQuery } from './get-my-student.query';
import { GetMyStudentResult } from './get-my-student.result';

export class GetMyStudentHandler {
  constructor(
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
  ) {}

  async execute(
    query: GetMyStudentQuery,
  ): Promise<GetMyStudentResult | null> {
    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        query.userId,
        query.email,
      );

    if (!student) {
      return null;
    }

    return GetMyStudentResult.fromStudent(student);
  }
}
