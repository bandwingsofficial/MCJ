export class DeleteCourseModuleCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
