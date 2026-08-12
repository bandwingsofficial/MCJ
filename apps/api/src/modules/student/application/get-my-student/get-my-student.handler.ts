import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';

import { GetMyStudentQuery } from './get-my-student.query';
import { GetMyStudentResult } from './get-my-student.result';

export class GetMyStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    query: GetMyStudentQuery,
  ): Promise<GetMyStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findByCreatedBy(query.userId),
    );

    return GetMyStudentResult.fromStudent(student);
  }
}
