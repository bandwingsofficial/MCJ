export class CreateJobApplicationCommand {
  constructor(
    public readonly userId: string,
    public readonly jobId: string,
    public readonly resumeFileId?: string | null,
    public readonly coverLetter?: string | null,
    public readonly currentLocation?: string | null,
    public readonly expectedSalary?: number | null,
    public readonly remarks?: string | null,
  ) {}
}
