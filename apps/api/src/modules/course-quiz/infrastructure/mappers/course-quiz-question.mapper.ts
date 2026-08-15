import {
  CourseQuizOption as PrismaCourseQuizOption,
  CourseQuizQuestion as PrismaCourseQuizQuestion,
} from '@prisma/client';

import { CourseQuizQuestion } from '../../domain/entities/course-quiz-question.entity';
import { QuizQuestionType } from '../../domain/enums/quiz-question-type.enum';
import { CourseQuizOptionMapper } from './course-quiz-option.mapper';

type PrismaQuestionWithOptions = PrismaCourseQuizQuestion & {
  options: PrismaCourseQuizOption[];
};

export class CourseQuizQuestionMapper {
  static toDomain(record: PrismaQuestionWithOptions): CourseQuizQuestion {
    return CourseQuizQuestion.reconstitute({
      id: record.id,
      quizId: record.quizId,
      questionText: record.questionText,
      type: record.type as QuizQuestionType,
      explanation: record.explanation,
      points: record.points,
      displayOrder: record.displayOrder,
      options: record.options.map(CourseQuizOptionMapper.toDomain),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
