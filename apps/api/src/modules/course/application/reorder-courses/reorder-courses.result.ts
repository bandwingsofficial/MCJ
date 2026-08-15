export class ReorderCoursesResult {
  constructor(
    public readonly courseId: string,
    public readonly displayOrder: number,
  ) {}
}
