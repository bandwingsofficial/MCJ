export class DeleteCourseCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
