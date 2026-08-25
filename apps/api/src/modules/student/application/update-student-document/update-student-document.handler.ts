import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { StudentDocumentNotFoundException } from '../../domain/errors/student-document-not-found.exception';
import type { StudentDocumentRepository } from '../../domain/repositories/student-document.repository';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { StudentDocumentResult } from '../shared/student-document.result';

import { UpdateStudentDocumentCommand } from './update-student-document.command';

const STUDENT_DOCUMENT_UPLOAD_FOLDER = 'student-documents';

export class UpdateStudentDocumentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly documentRepo: StudentDocumentRepository,
    private readonly domainService: StudentDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: UpdateStudentDocumentCommand,
  ): Promise<StudentDocumentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.studentId, true),
    );

    this.domainService.ensureBranchAccess(student, command.branchId);

    const document = await this.documentRepo.findById(command.documentId);

    if (!document || document.studentId !== student.id) {
      throw new StudentDocumentNotFoundException(command.documentId);
    }

    let nextFileId = document.fileId;
    const previousFileId = document.fileId;

    if (command.fileId && command.fileId !== document.fileId) {
      const upload = await this.uploadDomainService.attachToEntity({
        uploadId: command.fileId,
        folder: STUDENT_DOCUMENT_UPLOAD_FOLDER,
        entityId: student.id,
        fileName: document.id,
      });

      nextFileId = upload.id;
    }

    const updated = await this.documentRepo.update(document.id, {
      name: command.name?.trim() ?? document.name,
      type: command.type ?? document.type,
      description:
        command.description !== undefined
          ? command.description?.trim() || null
          : document.description,
      fileId: nextFileId,
      updatedBy: command.updatedBy ?? null,
    });

    if (nextFileId !== previousFileId) {
      await this.uploadDomainService.permanentDelete(previousFileId);
    }

    return StudentDocumentResult.fromEntity(updated);
  }
}
