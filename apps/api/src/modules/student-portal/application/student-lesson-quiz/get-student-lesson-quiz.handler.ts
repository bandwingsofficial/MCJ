import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { CourseHierarchyService } from '@modules/course/infrastructure/services/course-hierarchy.service';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { LessonProgressRepository } from '../../domain/repositories/lesson-progress.repository';
import { CourseAccessService } from '../../domain/services/course-access.service';
import {
  StudentLessonQuizResult,
  StudentQuizAttemptSummaryResult,
  StudentQuizOptionResult,
  StudentQuizQuestionResult,
} from './student-lesson-quiz.result';

export class GetStudentLessonQuizHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly hierarchyService: CourseHierarchyService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: {
    userId: string;
    courseId: string;
    lessonId: string;
  }): Promise<StudentLessonQuizResult> {
    await this.courseAccessService.requireAdmittedEnrollment(
      query.userId,
      query.courseId,
    );

    const belongs = await this.hierarchyService.lessonBelongsToCourse(
      query.courseId,
      query.lessonId,
    );

    if (!belongs) {
      throw new BaseException(
        ERROR_CODES.COURSE_LESSON_NOT_FOUND,
        'Lesson does not belong to course',
        404,
      );
    }

    const quiz = await this.prisma.courseQuiz.findFirst({
      where: {
        lessonId: query.lessonId,
        isDeleted: false,
        status: 'PUBLISHED',
      },
      include: {
        questions: {
          orderBy: { displayOrder: 'asc' },
          include: {
            options: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new BaseException(
        ERROR_CODES.COURSE_QUIZ_NOT_FOUND,
        'Quiz not found for this lesson',
        404,
      );
    }

    const student =
      await this.courseAccessService.resolveStudentFromUserId(
        query.userId,
      );

    const latestAttempt = await this.prisma.lessonQuizAttempt.findFirst({
      where: {
        studentId: student.id,
        lessonId: query.lessonId,
        quizId: quiz.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return new StudentLessonQuizResult(
      quiz.id,
      quiz.lessonId,
      quiz.title,
      quiz.description,
      quiz.status,
      quiz.passingScore,
      quiz.timeLimitMinutes,
      quiz.questions.length,
      quiz.questions.map(
        (question) =>
          new StudentQuizQuestionResult(
            question.id,
            question.questionText,
            question.type,
            question.explanation,
            question.points,
            question.displayOrder,
            question.options.map(
              (option) =>
                new StudentQuizOptionResult(
                  option.id,
                  option.optionText,
                  option.displayOrder,
                ),
            ),
          ),
      ),
      latestAttempt
        ? new StudentQuizAttemptSummaryResult(
            latestAttempt.id,
            latestAttempt.score,
            latestAttempt.totalPoints,
            latestAttempt.percentage,
            latestAttempt.passed,
            latestAttempt.createdAt,
          )
        : null,
    );
  }
}
