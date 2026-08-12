export class GetStudentCourseQuery {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
  ) {}
}
