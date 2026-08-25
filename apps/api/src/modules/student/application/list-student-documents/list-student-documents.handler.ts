import type { StudentDocumentRepository } from '../../domain/repositories/student-document.repository';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { StudentDocumentResult } from '../shared/student-document.result';

import { ListStudentDocumentsQuery } from './list-student-documents.query';

export class ListStudentDocumentsHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly documentRepo: StudentDocumentRepository,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    query: ListStudentDocumentsQuery,
  ): Promise<StudentDocumentResult[]> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(query.studentId, true),
    );

    this.domainService.ensureBranchAccess(student, query.branchId);

    const documents = await this.documentRepo.findByStudentId(student.id);

    return documents.map((document) =>
      StudentDocumentResult.fromEntity(document),
    );
  }
}
