export class StudentQuizOptionResult {
  constructor(
    public readonly id: string,
    public readonly optionText: string,
    public readonly displayOrder: number,
  ) {}
}

export class StudentQuizQuestionResult {
  constructor(
    public readonly id: string,
    public readonly questionText: string,
    public readonly type: string,
    public readonly explanation: string | null,
    public readonly points: number,
    public readonly displayOrder: number,
    public readonly options: StudentQuizOptionResult[],
  ) {}
}

export class StudentQuizAttemptSummaryResult {
  constructor(
    public readonly id: string,
    public readonly score: number,
    public readonly totalPoints: number,
    public readonly percentage: number,
    public readonly passed: boolean,
    public readonly createdAt: Date,
  ) {}
}

export class StudentLessonQuizResult {
  constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: string,
    public readonly passingScore: number | null,
    public readonly timeLimitMinutes: number | null,
    public readonly questionCount: number,
    public readonly questions: StudentQuizQuestionResult[],
    public readonly latestAttempt: StudentQuizAttemptSummaryResult | null,
  ) {}
}

export class StudentQuizSubmitResult {
  constructor(
    public readonly attemptId: string,
    public readonly score: number,
    public readonly totalPoints: number,
    public readonly percentage: number,
    public readonly passed: boolean,
    public readonly lessonMarkedComplete: boolean,
  ) {}
}
