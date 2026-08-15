export class ReorderQuestionsCommand {
  constructor(
    public readonly quizId: string,
    public readonly questionIds: string[],
  ) {}
}
