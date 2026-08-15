export class GetCourseSummaryResult {
  constructor(
    public readonly courseId: string,
    public readonly batches: number,
    public readonly students: number,
    public readonly instructors: number,
    public readonly branches: number,
    public readonly modules: number,
    public readonly lessons: number,
    public readonly quizzes: number,
  ) {}
}
