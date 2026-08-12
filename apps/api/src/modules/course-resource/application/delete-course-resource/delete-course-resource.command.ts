export class DeleteCourseResourceCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
