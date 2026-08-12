export class CourseImage {
  constructor(
    public readonly id: string,
    public readonly courseId: string,
    public readonly fileId: string,
    public displayOrder: number | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    courseId: string;
    fileId: string;
    displayOrder?: number | null;
  }): CourseImage {
    return new CourseImage(
      params.id,
      params.courseId,
      params.fileId,
      params.displayOrder ?? null,
      new Date(),
      new Date(),
    );
  }
}
