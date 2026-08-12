export class GetStudentQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
    public readonly branchId?: string,
  ) {}
}
