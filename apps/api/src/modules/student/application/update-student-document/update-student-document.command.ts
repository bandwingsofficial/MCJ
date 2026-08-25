import { StudentDocumentType } from '../../domain/enums/student-document-type.enum';

export class UpdateStudentDocumentCommand {
  constructor(
    public readonly studentId: string,
    public readonly documentId: string,
    public readonly name?: string,
    public readonly type?: StudentDocumentType,
    public readonly fileId?: string,
    public readonly description?: string | null,
    public readonly updatedBy?: string,
    public readonly branchId?: string,
  ) {}
}
