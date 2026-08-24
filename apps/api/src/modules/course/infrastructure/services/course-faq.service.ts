import { Injectable, NotFoundException } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { countWords } from '@common/utils/word-count.util';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

export const COURSE_FAQ_MIN_WORDS = 10;
export const COURSE_FAQ_MAX_WORDS = 100;

export interface CourseFaqRecord {
  id: string;
  courseId: string;
  question: string;
  answer: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CourseFaqService {
  constructor(private readonly prisma: PrismaService) {}

  async listByCourseId(courseId: string): Promise<CourseFaqRecord[]> {
    return this.prisma.courseFaq.findMany({
      where: { courseId },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(
    courseId: string,
    question: string,
    answer: string,
    createdBy?: string,
  ): Promise<CourseFaqRecord> {
    const normalizedQuestion = this.normalizeFaqField('question', question);
    const normalizedAnswer = this.normalizeFaqField('answer', answer);

    const maxOrder = await this.prisma.courseFaq.aggregate({
      where: { courseId },
      _max: { displayOrder: true },
    });

    return this.prisma.courseFaq.create({
      data: {
        courseId,
        question: normalizedQuestion,
        answer: normalizedAnswer,
        displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
        createdBy,
        updatedBy: createdBy,
      },
    });
  }

  async update(
    courseId: string,
    faqId: string,
    question: string,
    answer: string,
    updatedBy?: string,
  ): Promise<CourseFaqRecord> {
    await this.ensureExists(courseId, faqId);

    const normalizedQuestion = this.normalizeFaqField('question', question);
    const normalizedAnswer = this.normalizeFaqField('answer', answer);

    return this.prisma.courseFaq.update({
      where: { id: faqId },
      data: {
        question: normalizedQuestion,
        answer: normalizedAnswer,
        updatedBy,
      },
    });
  }

  async permanentDelete(courseId: string, faqId: string): Promise<void> {
    await this.ensureExists(courseId, faqId);
    await this.prisma.courseFaq.delete({ where: { id: faqId } });
  }

  async reorder(
    courseId: string,
    orderedIds: string[],
  ): Promise<CourseFaqRecord[]> {
    const existing = await this.listByCourseId(courseId);
    const existingIds = new Set(existing.map((item) => item.id));

    if (
      orderedIds.length !== existing.length ||
      orderedIds.some((id) => !existingIds.has(id))
    ) {
      throw new NotFoundException('Invalid FAQ order payload');
    }

    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.courseFaq.update({
          where: { id },
          data: { displayOrder: index + 1 },
        }),
      ),
    );

    return this.listByCourseId(courseId);
  }

  private normalizeFaqField(
    field: 'question' | 'answer',
    value: string,
  ): string {
    const label = field === 'question' ? 'Question' : 'Answer';
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        `${label} is required`,
        400,
        {
          errors: {
            [field]: [`${label} is required`],
          },
        },
      );
    }

    const words = countWords(trimmed);

    if (words < COURSE_FAQ_MIN_WORDS) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        `${label} must be at least ${COURSE_FAQ_MIN_WORDS} words`,
        400,
        {
          errors: {
            [field]: [
              `${label} must be at least ${COURSE_FAQ_MIN_WORDS} words`,
            ],
          },
        },
      );
    }

    if (words > COURSE_FAQ_MAX_WORDS) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        `${label} cannot exceed ${COURSE_FAQ_MAX_WORDS} words`,
        400,
        {
          errors: {
            [field]: [
              `${label} cannot exceed ${COURSE_FAQ_MAX_WORDS} words`,
            ],
          },
        },
      );
    }

    return trimmed;
  }

  private async ensureExists(courseId: string, faqId: string) {
    const faq = await this.prisma.courseFaq.findFirst({
      where: { id: faqId, courseId },
    });

    if (!faq) {
      throw new NotFoundException('Course FAQ not found');
    }

    return faq;
  }
}
