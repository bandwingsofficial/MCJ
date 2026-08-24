import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { CourseLesson } from '../../domain/entities/course-lesson.entity';
import {
  CourseLessonListFilters,
  CourseLessonRepository,
} from '../../domain/repositories/course-lesson.repository';
import { CourseLessonMapper } from '../mappers/course-lesson.mapper';

export class PrismaCourseLessonRepository
  implements CourseLessonRepository
{
  private readonly logger = new Logger(
    PrismaCourseLessonRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(lesson: CourseLesson): Promise<void> {
    this.logger.log(`💾 Saving course lesson: ${lesson.id}`);

    const data = CourseLessonMapper.toPersistence(lesson);

    await this.prisma.courseLesson.upsert({
      where: { id: lesson.id },
      update: { ...data },
      create: { ...data },
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<CourseLesson | null> {
    const record = await this.prisma.courseLesson.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CourseLessonMapper.toDomain(record) : null;
  }

  async findBySlug(
    moduleId: string,
    slug: string,
    includeDeleted = false,
  ): Promise<CourseLesson | null> {
    const record = await this.prisma.courseLesson.findFirst({
      where: {
        moduleId,
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CourseLessonMapper.toDomain(record) : null;
  }

  async findByModuleId(
    moduleId: string,
    includeDeleted = false,
  ): Promise<CourseLesson[]> {
    const records = await this.prisma.courseLesson.findMany({
      where: {
        moduleId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return records.map(CourseLessonMapper.toDomain);
  }

  async findAll(
    filters: CourseLessonListFilters = {},
  ): Promise<CourseLesson[]> {
    const records = await this.prisma.courseLesson.findMany({
      where: this.buildWhere(filters),
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(CourseLessonMapper.toDomain);
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.courseLesson.delete({
      where: { id },
    });
  }

  async getMaxDisplayOrder(
    moduleId: string,
    parentLessonId: string | null = null,
  ): Promise<number> {
    const result = await this.prisma.courseLesson.aggregate({
      where: this.buildOrderScopeWhere(moduleId, parentLessonId),
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? 0;
  }

  async shiftDisplayOrders(
    moduleId: string,
    oldOrder: number,
    newOrder: number,
    parentLessonId: string | null = null,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    const scope = this.buildOrderScopeWhere(moduleId, parentLessonId);

    if (newOrder < oldOrder) {
      await this.prisma.courseLesson.updateMany({
        where: {
          ...scope,
          displayOrder: { gte: newOrder, lt: oldOrder },
        },
        data: { displayOrder: { increment: 1 } },
      });
    } else {
      await this.prisma.courseLesson.updateMany({
        where: {
          ...scope,
          displayOrder: { gt: oldOrder, lte: newOrder },
        },
        data: { displayOrder: { decrement: 1 } },
      });
    }
  }

  async closeDisplayOrderGap(
    moduleId: string,
    deletedDisplayOrder: number,
    parentLessonId: string | null = null,
  ): Promise<void> {
    await this.prisma.courseLesson.updateMany({
      where: {
        ...this.buildOrderScopeWhere(moduleId, parentLessonId),
        displayOrder: { gt: deletedDisplayOrder },
      },
      data: { displayOrder: { decrement: 1 } },
    });
  }

  async move(
    id: string,
    moduleId: string,
    oldOrder: number,
    newOrder: number,
    updatedBy?: string | null,
    parentLessonId: string | null = null,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    const scope = this.buildOrderScopeWhere(moduleId, parentLessonId);

    await this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        await tx.courseLesson.updateMany({
          where: {
            ...scope,
            displayOrder: { gte: newOrder, lt: oldOrder },
          },
          data: { displayOrder: { increment: 1 } },
        });
      } else {
        await tx.courseLesson.updateMany({
          where: {
            ...scope,
            displayOrder: { gt: oldOrder, lte: newOrder },
          },
          data: { displayOrder: { decrement: 1 } },
        });
      }

      await tx.courseLesson.update({
        where: { id },
        data: {
          displayOrder: newOrder,
          updatedBy: updatedBy ?? undefined,
          updatedAt: new Date(),
        },
      });
    });
  }

  private buildOrderScopeWhere(
    moduleId: string,
    parentLessonId: string | null,
  ): Prisma.CourseLessonWhereInput {
    return {
      moduleId,
      isDeleted: false,
      parentLessonId,
    };
  }

  async cascadeSoftDelete(
    lessonId: string,
    deletedBy?: string | null,
  ): Promise<void> {
    await this.prisma.courseResource.updateMany({
      where: { lessonId, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy ?? null,
      },
    });
  }

  async cascadeRestore(lessonId: string): Promise<void> {
    await this.prisma.courseResource.updateMany({
      where: { lessonId, isDeleted: true },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    });
  }

  private buildWhere(
    filters: CourseLessonListFilters,
  ): Prisma.CourseLessonWhereInput {
    const where: Prisma.CourseLessonWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.moduleId) {
      where.moduleId = filters.moduleId;
    }

    if (filters.parentLessonId !== undefined) {
      where.parentLessonId = filters.parentLessonId;
    }

    if (filters.contentType) {
      where.contentType = filters.contentType as Prisma.CourseLessonWhereInput['contentType'];
    }

    if (filters.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }
}
