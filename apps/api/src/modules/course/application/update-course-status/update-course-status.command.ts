export class UpdateCourseStatusCommand {
  constructor(
    public readonly id: string,
    public readonly activate: boolean,
    public readonly updatedBy?: string,
  ) {}
}
