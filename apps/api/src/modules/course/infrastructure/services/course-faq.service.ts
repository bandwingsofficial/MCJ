import { Injectable, NotFoundException } from '@nestjs/common';

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
    const maxOrder = await this.prisma.courseFaq.aggregate({
      where: { courseId },
      _max: { displayOrder: true },
    });

    return this.prisma.courseFaq.create({
      data: {
        courseId,
        question: question.trim(),
        answer: answer.trim(),
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

    return this.prisma.courseFaq.update({
      where: { id: faqId },
      data: {
        question: question.trim(),
        answer: answer.trim(),
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
