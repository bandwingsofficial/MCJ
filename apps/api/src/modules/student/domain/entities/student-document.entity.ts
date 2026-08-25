import { StudentDocumentType } from '../enums/student-document-type.enum';

export class StudentDocument {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public name: string,
    public type: StudentDocumentType,
    public description: string | null,
    public fileId: string,
    public fileName: string | null,
    public fileSize: number | null,
    public fileUrl: string | null,
    public mimeType: string | null,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
