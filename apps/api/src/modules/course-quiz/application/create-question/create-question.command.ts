import { QuizQuestionType } from '../../domain/enums/quiz-question-type.enum';

export interface CreateQuestionOptionInput {
  optionText: string;
  isCorrect?: boolean;
  displayOrder?: number;
}

export class CreateQuestionCommand {
  constructor(
    public readonly quizId: string,
    public readonly questionText: string,
    public readonly type?: QuizQuestionType,
    public readonly explanation?: string | null,
    public readonly points?: number,
    public readonly options: CreateQuestionOptionInput[] = [],
  ) {}
}
