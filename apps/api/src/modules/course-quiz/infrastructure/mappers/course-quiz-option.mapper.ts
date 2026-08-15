import { CourseQuizOption as PrismaCourseQuizOption } from '@prisma/client';

import { CourseQuizOption } from '../../domain/entities/course-quiz-option.entity';

export class CourseQuizOptionMapper {
  static toDomain(record: PrismaCourseQuizOption): CourseQuizOption {
    return CourseQuizOption.reconstitute({
      id: record.id,
      questionId: record.questionId,
      optionText: record.optionText,
      isCorrect: record.isCorrect,
      displayOrder: record.displayOrder,
    });
  }
}
