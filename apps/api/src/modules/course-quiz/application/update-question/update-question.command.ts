import { QuizQuestionType } from '../../domain/enums/quiz-question-type.enum';

export interface UpdateQuestionOptionInput {
  optionText: string;
  isCorrect?: boolean;
  displayOrder?: number;
}

export class UpdateQuestionCommand {
  constructor(
    public readonly id: string,
    public readonly questionText?: string,
    public readonly type?: QuizQuestionType,
    public readonly explanation?: string | null,
    public readonly points?: number,
    public readonly options?: UpdateQuestionOptionInput[],
  ) {}
}
