import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { StudentDocumentNotFoundException } from '../../domain/errors/student-document-not-found.exception';
import type { StudentDocumentRepository } from '../../domain/repositories/student-document.repository';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';

import { DeleteStudentDocumentCommand } from './delete-student-document.command';

export class DeleteStudentDocumentResult {
  constructor(
    public readonly id: string,
    public readonly permanentlyDeleted: boolean,
  ) {}
}

export class DeleteStudentDocumentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly documentRepo: StudentDocumentRepository,
    private readonly domainService: StudentDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: DeleteStudentDocumentCommand,
  ): Promise<DeleteStudentDocumentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.studentId, true),
    );

    this.domainService.ensureBranchAccess(student, command.branchId);

    const document = await this.documentRepo.findById(command.documentId);

    if (!document || document.studentId !== student.id) {
      throw new StudentDocumentNotFoundException(command.documentId);
    }

    await this.documentRepo.deleteById(document.id);
    await this.uploadDomainService.permanentDelete(document.fileId);

    return new DeleteStudentDocumentResult(document.id, true);
  }
}
