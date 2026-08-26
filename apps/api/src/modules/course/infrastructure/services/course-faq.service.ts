import { Injectable, NotFoundException } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

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
    await this.ensureCourseExists(courseId);

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
    await this.ensureCourseExists(courseId);

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

    return trimmed;
  }

  private async ensureCourseExists(courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }
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
