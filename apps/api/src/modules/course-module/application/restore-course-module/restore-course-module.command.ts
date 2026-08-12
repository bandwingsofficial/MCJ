export class RestoreCourseModuleCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
