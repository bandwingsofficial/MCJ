import { randomUUID } from 'crypto';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { CourseHierarchyService } from '@modules/course/infrastructure/services/course-hierarchy.service';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { LessonProgressRepository } from '../../domain/repositories/lesson-progress.repository';
import { CourseAccessService } from '../../domain/services/course-access.service';
import { StudentQuizSubmitResult } from './student-lesson-quiz.result';

type SubmitAnswer = {
  questionId: string;
  selectedOptionIds: string[];
};

export class SubmitStudentLessonQuizHandler {
  constructor(
    private readonly courseAccessService: CourseAccessService,
    private readonly hierarchyService: CourseHierarchyService,
    private readonly lessonProgressRepo: LessonProgressRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: {
    userId: string;
    courseId: string;
    lessonId: string;
    answers: SubmitAnswer[];
  }): Promise<StudentQuizSubmitResult> {
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
          include: {
            options: true,
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
        command.userId,
      );

    const answerMap = new Map(
      command.answers.map((answer) => [
        answer.questionId,
        answer.selectedOptionIds ?? [],
      ]),
    );

    let score = 0;
    let totalPoints = 0;
    const persistedAnswers: Record<
      string,
      { selectedOptionIds: string[]; correct: boolean; earnedPoints: number }
    > = {};

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const selectedOptionIds =
        answerMap.get(question.id)?.filter(Boolean) ?? [];
      const correctOptionIds = question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.id)
        .sort();
      const selectedSorted = [...selectedOptionIds].sort();
      const isCorrect =
        correctOptionIds.length === selectedSorted.length &&
        correctOptionIds.every(
          (optionId, index) => optionId === selectedSorted[index],
        );
      const earnedPoints = isCorrect ? question.points : 0;
      score += earnedPoints;
      persistedAnswers[question.id] = {
        selectedOptionIds,
        correct: isCorrect,
        earnedPoints,
      };
    }

    const percentage =
      totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed =
      quiz.passingScore == null ? percentage >= 0 : percentage >= quiz.passingScore;

    const attempt = await this.prisma.lessonQuizAttempt.create({
      data: {
        id: randomUUID(),
        studentId: student.id,
        courseId: command.courseId,
        lessonId: command.lessonId,
        quizId: quiz.id,
        score,
        totalPoints,
        percentage,
        passed,
        answers: persistedAnswers,
      },
    });

    let lessonMarkedComplete = false;

    if (passed) {
      await this.lessonProgressRepo.upsert({
        studentId: student.id,
        courseId: command.courseId,
        lessonId: command.lessonId,
        isCompleted: true,
      });
      lessonMarkedComplete = true;
    }

    return new StudentQuizSubmitResult(
      attempt.id,
      score,
      totalPoints,
      percentage,
      passed,
      lessonMarkedComplete,
    );
  }
}
