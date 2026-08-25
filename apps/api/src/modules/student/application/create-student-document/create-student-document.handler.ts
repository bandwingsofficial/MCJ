import { randomUUID } from 'crypto';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { StudentDocumentRepository } from '../../domain/repositories/student-document.repository';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { StudentDocumentResult } from '../shared/student-document.result';

import { CreateStudentDocumentCommand } from './create-student-document.command';

const STUDENT_DOCUMENT_UPLOAD_FOLDER = 'student-documents';

export class CreateStudentDocumentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly documentRepo: StudentDocumentRepository,
    private readonly domainService: StudentDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: CreateStudentDocumentCommand,
  ): Promise<StudentDocumentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.studentId, true),
    );

    this.domainService.ensureBranchAccess(student, command.branchId);

    const documentId = randomUUID();
    const upload = await this.uploadDomainService.attachToEntity({
      uploadId: command.fileId,
      folder: STUDENT_DOCUMENT_UPLOAD_FOLDER,
      entityId: student.id,
      fileName: documentId,
    });

    const document = await this.documentRepo.create({
      id: documentId,
      studentId: student.id,
      name: command.name.trim(),
      type: command.type,
      description: command.description?.trim() || null,
      fileId: upload.id,
      createdBy: command.createdBy ?? null,
    });

    return StudentDocumentResult.fromEntity(document);
  }
}
