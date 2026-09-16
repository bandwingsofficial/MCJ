import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { CourseHierarchyService } from '@modules/course/infrastructure/services/course-hierarchy.service';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { CourseAccessService } from '../../domain/services/course-access.service';
import { StudentQuizValidateAnswerResult } from './student-lesson-quiz.result';

export class CheckStudentLessonQuizAnswerHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly hierarchyService: CourseHierarchyService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: {
    userId: string;
    courseId: string;
    lessonId: string;
    questionId: string;
    selectedOptionIds: string[];
  }): Promise<StudentQuizValidateAnswerResult> {
    await this.courseAccessService.requireAdmittedEnrollment(
      command.userId,
      command.courseId,
    );

    const belongs = await this.hierarchyService.lessonBelongsToCourse(
      command.courseId,
      command.lessonId,
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
        lessonId: command.lessonId,
        isDeleted: false,
        status: 'PUBLISHED',
      },
      include: {
        questions: {
          where: { id: command.questionId },
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz || quiz.questions.length === 0) {
      throw new BaseException(
        ERROR_CODES.COURSE_QUIZ_NOT_FOUND,
        'Quiz question not found for this lesson',
        404,
      );
    }

    const question = quiz.questions[0];
    const selectedOptionIds = command.selectedOptionIds.filter(Boolean);
    const correctOptionIds = question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id)
      .sort();
    const selectedSorted = [...selectedOptionIds].sort();
    const correct =
      correctOptionIds.length === selectedSorted.length &&
      correctOptionIds.every(
        (optionId, index) => optionId === selectedSorted[index],
      );
    const earnedPoints = correct ? question.points : 0;

    return new StudentQuizValidateAnswerResult(
      question.id,
      correct,
      correctOptionIds,
      question.explanation,
      earnedPoints,
      question.points,
    );
  }
}
