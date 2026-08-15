import {
  CourseQuiz as PrismaCourseQuiz,
  Prisma,
} from '@prisma/client';

import { CourseQuiz } from '../../domain/entities/course-quiz.entity';
import { QuizStatus } from '../../domain/enums/quiz-status.enum';

export class CourseQuizMapper {
  static toDomain(record: PrismaCourseQuiz): CourseQuiz {
    return CourseQuiz.reconstitute({
      id: record.id,
      lessonId: record.lessonId,
      title: record.title,
      description: record.description,
      status: record.status as QuizStatus,
      passingScore: record.passingScore,
      timeLimitMinutes: record.timeLimitMinutes,
      displayOrder: record.displayOrder,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    quiz: CourseQuiz,
  ): Prisma.CourseQuizUncheckedCreateInput {
    return {
      id: quiz.id,
      lessonId: quiz.lessonId,
      title: quiz.title,
      description: quiz.description,
      status: quiz.status,
      passingScore: quiz.passingScore,
      timeLimitMinutes: quiz.timeLimitMinutes,
      displayOrder: quiz.displayOrder,
      createdBy: quiz.createdBy,
      updatedBy: quiz.updatedBy,
      isDeleted: quiz.isDeleted,
      deletedAt: quiz.deletedAt,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };
  }
}
