import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';

import { GetStudentQuery } from './get-student.query';
import { GetStudentResult } from './get-student.result';

export class GetStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    query: GetStudentQuery,
  ): Promise<GetStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(
        query.id,
        query.includeDeleted,
      ),
    );

    this.domainService.ensureBranchAccess(
      student,
      query.branchId,
    );

    return GetStudentResult.fromEntity(student);
  }
}
