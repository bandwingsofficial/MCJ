export class UnassignInterviewCommand {
  constructor(
    public readonly applicationId: string,
    public readonly unassignedBy?: string,
  ) {}
}
