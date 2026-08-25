export class DeleteStudentDocumentCommand {
  constructor(
    public readonly studentId: string,
    public readonly documentId: string,
    public readonly branchId?: string,
  ) {}
}
