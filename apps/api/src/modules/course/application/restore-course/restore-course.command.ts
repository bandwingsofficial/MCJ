export class RestoreCourseCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
