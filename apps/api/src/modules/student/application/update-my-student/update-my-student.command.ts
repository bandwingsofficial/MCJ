export class UpdateMyStudentCommand {
  constructor(
    public readonly userId: string,
    public readonly qualification?: string,
    public readonly collegeName?: string,
    public readonly specialization?: string,
    public readonly passingYear?: number,
    public readonly parentName?: string,
    public readonly parentPhone?: string,
    public readonly emergencyContactName?: string,
    public readonly emergencyContactPhone?: string,
    public readonly notes?: string,
  ) {}
}
