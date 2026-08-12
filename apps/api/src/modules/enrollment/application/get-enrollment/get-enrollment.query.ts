export class GetEnrollmentQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted?: boolean,
    public readonly branchId?: string,
  ) {}
}
