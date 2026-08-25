import { StudentDocument } from '../../domain/entities/student-document.entity';
import { StudentDocumentType } from '../../domain/enums/student-document-type.enum';

export class StudentDocumentResult {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly name: string,
    public readonly type: StudentDocumentType,
    public readonly description: string | null,
    public readonly fileId: string,
    public readonly fileName: string | null,
    public readonly fileSize: number | null,
    public readonly fileUrl: string | null,
    public readonly mimeType: string | null,
    public readonly status: 'UPLOADED',
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromEntity(document: StudentDocument): StudentDocumentResult {
    return new StudentDocumentResult(
      document.id,
      document.studentId,
      document.name,
      document.type,
      document.description,
      document.fileId,
      document.fileName,
      document.fileSize,
      document.fileUrl,
      document.mimeType,
      'UPLOADED',
      document.createdBy,
      document.updatedBy,
      document.createdAt,
      document.updatedAt,
    );
  }
}
