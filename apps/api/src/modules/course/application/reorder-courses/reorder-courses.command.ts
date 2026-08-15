export class ReorderCoursesCommand {
  constructor(
    public readonly courseId: string,
    public readonly newDisplayOrder: number,
  ) {}
}
