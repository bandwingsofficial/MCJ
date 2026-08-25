export class ListStudentDocumentsQuery {
  constructor(
    public readonly studentId: string,
    public readonly branchId?: string,
  ) {}
}
