export class GetQuizQuery {
  constructor(
    public readonly id?: string,
    public readonly lessonId?: string,
    public readonly includeDeleted = false,
    public readonly includeQuestions = true,
  ) {}
}
