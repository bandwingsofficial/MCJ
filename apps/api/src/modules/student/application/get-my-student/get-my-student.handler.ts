import { ResolveAuthenticatedStudentService } from '../../domain/services/resolve-authenticated-student.service';
import { StudentDomainService } from '../../domain/services/student-domain.service';

import { GetMyStudentQuery } from './get-my-student.query';
import { GetMyStudentResult } from './get-my-student.result';

export class GetMyStudentHandler {
  constructor(
    private readonly domainService: StudentDomainService,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
  ) {}

  async execute(
    query: GetMyStudentQuery,
  ): Promise<GetMyStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        query.userId,
        query.email,
      ),
    );

    return GetMyStudentResult.fromStudent(student);
  }
}
