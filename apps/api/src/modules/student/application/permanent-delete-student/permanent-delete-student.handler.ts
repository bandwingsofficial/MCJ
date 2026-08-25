import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { StudentDocumentRepository } from '../../domain/repositories/student-document.repository';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';

import { PermanentDeleteStudentCommand } from './permanent-delete-student.command';
import { PermanentDeleteStudentResult } from './permanent-delete-student.result';

export class PermanentDeleteStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly documentRepo: StudentDocumentRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    command: PermanentDeleteStudentCommand,
  ): Promise<PermanentDeleteStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.id, true),
    );
    const documents = await this.documentRepo.findByStudentId(student.id);
    const fileIds = [
      ...documents.map((document) => document.fileId),
      ...(student.profileImageFileId ? [student.profileImageFileId] : []),
    ];

    await this.studentRepo.deletePermanent(student.id);

    for (const fileId of fileIds) {
      try {
        await this.uploadDomainService.permanentDelete(fileId);
      } catch {
        // File may already be gone; student deletion still succeeds.
      }
    }

    return new PermanentDeleteStudentResult(student.id, true);
  }
}
