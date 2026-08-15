import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { CourseQuiz } from '../../domain/entities/course-quiz.entity';
import { CourseQuizQuestion } from '../../domain/entities/course-quiz-question.entity';
import {
  CourseQuizListFilters,
  CourseQuizRepository,
} from '../../domain/repositories/course-quiz.repository';
import { CourseQuizMapper } from '../mappers/course-quiz.mapper';
import { CourseQuizQuestionMapper } from '../mappers/course-quiz-question.mapper';

export class PrismaCourseQuizRepository implements CourseQuizRepository {
  private readonly logger = new Logger(PrismaCourseQuizRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async save(quiz: CourseQuiz): Promise<void> {
    this.logger.log(`💾 Saving course quiz: ${quiz.id}`);

    const data = CourseQuizMapper.toPersistence(quiz);

    await this.prisma.courseQuiz.upsert({
      where: { id: quiz.id },
      update: { ...data },
      create: { ...data },
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<CourseQuiz | null> {
    const record = await this.prisma.courseQuiz.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CourseQuizMapper.toDomain(record) : null;
  }

  async findByLessonId(
    lessonId: string,
    includeDeleted = false,
  ): Promise<CourseQuiz | null> {
    const record = await this.prisma.courseQuiz.findFirst({
      where: {
        lessonId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CourseQuizMapper.toDomain(record) : null;
  }

  async findAll(
    filters: CourseQuizListFilters = {},
  ): Promise<CourseQuiz[]> {
    const records = await this.prisma.courseQuiz.findMany({
      where: this.buildWhere(filters),
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(CourseQuizMapper.toDomain);
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.courseQuiz.delete({
      where: { id },
    });
  }

  async saveQuestion(question: CourseQuizQuestion): Promise<void> {
    this.logger.log(`💾 Saving course quiz question: ${question.id}`);

    await this.prisma.$transaction(async (tx) => {
      await tx.courseQuizQuestion.upsert({
        where: { id: question.id },
        update: {
          quizId: question.quizId,
          questionText: question.questionText,
          type: question.type,
          explanation: question.explanation,
          points: question.points,
          displayOrder: question.displayOrder,
          updatedAt: question.updatedAt,
        },
        create: {
          id: question.id,
          quizId: question.quizId,
          questionText: question.questionText,
          type: question.type,
          explanation: question.explanation,
          points: question.points,
          displayOrder: question.displayOrder,
          createdAt: question.createdAt,
          updatedAt: question.updatedAt,
        },
      });

      await tx.courseQuizOption.deleteMany({
        where: { questionId: question.id },
      });

      if (question.options.length > 0) {
        await tx.courseQuizOption.createMany({
          data: question.options.map((option) => ({
            id: option.id,
            questionId: question.id,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
            displayOrder: option.displayOrder,
          })),
        });
      }
    });
  }

  async findQuestionById(id: string): Promise<CourseQuizQuestion | null> {
    const record = await this.prisma.courseQuizQuestion.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return record ? CourseQuizQuestionMapper.toDomain(record) : null;
  }

  async findQuestionsByQuizId(quizId: string): Promise<CourseQuizQuestion[]> {
    const records = await this.prisma.courseQuizQuestion.findMany({
      where: { quizId },
      include: {
        options: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return records.map(CourseQuizQuestionMapper.toDomain);
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.prisma.courseQuizQuestion.delete({
      where: { id },
    });
  }

  async getMaxQuestionDisplayOrder(quizId: string): Promise<number> {
    const result = await this.prisma.courseQuizQuestion.aggregate({
      where: { quizId },
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? 0;
  }

  async closeQuestionDisplayOrderGap(
    quizId: string,
    deletedDisplayOrder: number,
  ): Promise<void> {
    await this.prisma.courseQuizQuestion.updateMany({
      where: {
        quizId,
        displayOrder: { gt: deletedDisplayOrder },
      },
      data: { displayOrder: { decrement: 1 } },
    });
  }

  async reorderQuestions(
    quizId: string,
    orderedIds: string[],
  ): Promise<void> {
    const uniqueIds = [...new Set(orderedIds)];

    if (uniqueIds.length !== orderedIds.length) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Duplicate question ids in reorder payload',
        400,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.courseQuizQuestion.findMany({
        where: { quizId },
        select: { id: true },
        orderBy: { displayOrder: 'asc' },
      });

      const existingIds = new Set(existing.map((item) => item.id));
      const payloadIds = new Set(uniqueIds);

      if (
        existingIds.size !== payloadIds.size ||
        ![...payloadIds].every((id) => existingIds.has(id))
      ) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Reorder payload must include every question exactly once',
          400,
        );
      }

      await Promise.all(
        uniqueIds.map((id, index) =>
          tx.courseQuizQuestion.update({
            where: { id },
            data: { displayOrder: index + 1 },
          }),
        ),
      );
    });
  }

  private buildWhere(
    filters: CourseQuizListFilters,
  ): Prisma.CourseQuizWhereInput {
    const where: Prisma.CourseQuizWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.lessonId) {
      where.lessonId = filters.lessonId;
    }

    return where;
  }
}
