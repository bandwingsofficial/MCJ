export class RestoreCourseResourceCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
