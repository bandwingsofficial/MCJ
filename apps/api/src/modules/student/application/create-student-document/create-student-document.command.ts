import { StudentDocumentType } from '../../domain/enums/student-document-type.enum';

export class CreateStudentDocumentCommand {
  constructor(
    public readonly studentId: string,
    public readonly name: string,
    public readonly type: StudentDocumentType,
    public readonly fileId: string,
    public readonly description?: string,
    public readonly createdBy?: string,
    public readonly branchId?: string,
  ) {}
}
