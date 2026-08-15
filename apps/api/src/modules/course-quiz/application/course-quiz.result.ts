import { QuizQuestionType } from '../domain/enums/quiz-question-type.enum';
import { QuizStatus } from '../domain/enums/quiz-status.enum';

export class CourseQuizResult {
  constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: QuizStatus,
    public readonly passingScore: number | null,
    public readonly timeLimitMinutes: number | null,
    public readonly displayOrder: number,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class CourseQuizDetailResult extends CourseQuizResult {
  constructor(
    id: string,
    lessonId: string,
    title: string,
    description: string | null,
    status: QuizStatus,
    passingScore: number | null,
    timeLimitMinutes: number | null,
    displayOrder: number,
    createdBy: string | null,
    updatedBy: string | null,
    isDeleted: boolean,
    deletedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    public readonly questions: CourseQuizQuestionResult[],
  ) {
    super(
      id,
      lessonId,
      title,
      description,
      status,
      passingScore,
      timeLimitMinutes,
      displayOrder,
      createdBy,
      updatedBy,
      isDeleted,
      deletedAt,
      createdAt,
      updatedAt,
    );
  }
}

export class CourseQuizQuestionResult {
  constructor(
    public readonly id: string,
    public readonly quizId: string,
    public readonly questionText: string,
    public readonly type: QuizQuestionType,
    public readonly explanation: string | null,
    public readonly points: number,
    public readonly displayOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly options: CourseQuizOptionResult[],
  ) {}
}

export class CourseQuizOptionResult {
  constructor(
    public readonly id: string,
    public readonly questionId: string,
    public readonly optionText: string,
    public readonly isCorrect: boolean,
    public readonly displayOrder: number,
  ) {}
}
