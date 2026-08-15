import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import { CourseQuizResult } from '../course-quiz.result';

import { ListCourseQuizzesQuery } from './list-course-quizzes.query';

export class ListCourseQuizzesHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
  ) {}

  async execute(
    query: ListCourseQuizzesQuery,
  ): Promise<CourseQuizResult[]> {
    const quizzes = await this.courseQuizRepo.findAll({
      lessonId: query.lessonId,
      includeDeleted: query.includeDeleted,
      skip: query.skip,
      take: query.take,
    });

    return CourseQuizResponseMapper.toResultList(quizzes);
  }
}
