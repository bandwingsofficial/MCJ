export class DeleteCourseResult {
  constructor(
    public readonly id: string,
    public readonly deleted: boolean,
    public readonly deletedAt: Date | null,
  ) {}
}
