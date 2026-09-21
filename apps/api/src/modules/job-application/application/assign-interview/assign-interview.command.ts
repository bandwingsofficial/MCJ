export class AssignInterviewCommand {
  constructor(
    public readonly applicationId: string,
    public readonly branchId: string,
    public readonly interviewerId: string,
    public readonly assignedBy?: string,
  ) {}
}
