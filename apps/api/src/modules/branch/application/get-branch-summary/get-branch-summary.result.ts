export class GetBranchSummaryResult {
  constructor(
    public readonly branchId: string,
    public readonly students: number,
    public readonly courses: number,
    public readonly batches: number,
    public readonly enrollments: number,
    public readonly instructors: number,
    public readonly categories: number,
  ) {}
}
