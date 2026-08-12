import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { CourseModule } from '../../domain/entities/course-module.entity';
import {
  CourseModuleListFilters,
  CourseModuleRepository,
} from '../../domain/repositories/course-module.repository';
import { CourseModuleMapper } from '../mappers/course-module.mapper';

export class PrismaCourseModuleRepository
  implements CourseModuleRepository
{
  private readonly logger = new Logger(
    PrismaCourseModuleRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(module: CourseModule): Promise<void> {
    this.logger.log(`💾 Saving course module: ${module.id}`);

    const data = CourseModuleMapper.toPersistence(module);

    await this.prisma.courseModule.upsert({
      where: { id: module.id },
      update: { ...data },
      create: { ...data },
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<CourseModule | null> {
    const record = await this.prisma.courseModule.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CourseModuleMapper.toDomain(record) : null;
  }

  async findBySlug(
    courseId: string,
    slug: string,
    includeDeleted = false,
  ): Promise<CourseModule | null> {
    const record = await this.prisma.courseModule.findFirst({
      where: {
        courseId,
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CourseModuleMapper.toDomain(record) : null;
  }

  async findByCourseId(
    courseId: string,
    includeDeleted = false,
  ): Promise<CourseModule[]> {
    const records = await this.prisma.courseModule.findMany({
      where: {
        courseId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return records.map(CourseModuleMapper.toDomain);
  }

  async findAll(
    filters: CourseModuleListFilters = {},
  ): Promise<CourseModule[]> {
    const records = await this.prisma.courseModule.findMany({
      where: this.buildWhere(filters),
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(CourseModuleMapper.toDomain);
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.courseModule.delete({
      where: { id },
    });
  }

  async getMaxDisplayOrder(courseId: string): Promise<number> {
    const result = await this.prisma.courseModule.aggregate({
      where: {
        courseId,
        isDeleted: false,
      },
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? 0;
  }

  async shiftDisplayOrders(
    courseId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    if (newOrder < oldOrder) {
      await this.prisma.courseModule.updateMany({
        where: {
          courseId,
          isDeleted: false,
          displayOrder: {
            gte: newOrder,
            lt: oldOrder,
          },
        },
        data: {
          displayOrder: {
            increment: 1,
          },
        },
      });
    } else {
      await this.prisma.courseModule.updateMany({
        where: {
          courseId,
          isDeleted: false,
          displayOrder: {
            gt: oldOrder,
            lte: newOrder,
          },
        },
        data: {
          displayOrder: {
            decrement: 1,
          },
        },
      });
    }
  }

  async closeDisplayOrderGap(
    courseId: string,
    deletedDisplayOrder: number,
  ): Promise<void> {
    await this.prisma.courseModule.updateMany({
      where: {
        courseId,
        isDeleted: false,
        displayOrder: {
          gt: deletedDisplayOrder,
        },
      },
      data: {
        displayOrder: {
          decrement: 1,
        },
      },
    });
  }

  async move(
    id: string,
    courseId: string,
    oldOrder: number,
    newOrder: number,
    updatedBy?: string | null,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        await tx.courseModule.updateMany({
          where: {
            courseId,
            isDeleted: false,
            displayOrder: { gte: newOrder, lt: oldOrder },
          },
          data: { displayOrder: { increment: 1 } },
        });
      } else {
        await tx.courseModule.updateMany({
          where: {
            courseId,
            isDeleted: false,
            displayOrder: { gt: oldOrder, lte: newOrder },
          },
          data: { displayOrder: { decrement: 1 } },
        });
      }

      await tx.courseModule.update({
        where: { id },
        data: {
          displayOrder: newOrder,
          updatedBy: updatedBy ?? undefined,
          updatedAt: new Date(),
        },
      });
    });
  }

  async cascadeSoftDelete(
    moduleId: string,
    deletedBy?: string | null,
  ): Promise<void> {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const lessons = await tx.courseLesson.findMany({
        where: { moduleId, isDeleted: false },
        select: { id: true },
      });

      const lessonIds = lessons.map((lesson) => lesson.id);

      if (lessonIds.length) {
        await tx.courseResource.updateMany({
          where: {
            lessonId: { in: lessonIds },
            isDeleted: false,
          },
          data: {
            isDeleted: true,
            deletedAt: now,
            deletedBy: deletedBy ?? null,
          },
        });
      }

      await tx.courseLesson.updateMany({
        where: { moduleId, isDeleted: false },
        data: {
          isDeleted: true,
          deletedAt: now,
          deletedBy: deletedBy ?? null,
        },
      });
    });
  }

  async cascadeRestore(moduleId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const lessons = await tx.courseLesson.findMany({
        where: { moduleId, isDeleted: true },
        select: { id: true },
      });

      const lessonIds = lessons.map((lesson) => lesson.id);

      if (lessonIds.length) {
        await tx.courseResource.updateMany({
          where: {
            lessonId: { in: lessonIds },
            isDeleted: true,
          },
          data: {
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
          },
        });
      }

      await tx.courseLesson.updateMany({
        where: { moduleId, isDeleted: true },
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        },
      });
    });
  }

  private buildWhere(
    filters: CourseModuleListFilters,
  ): Prisma.CourseModuleWhereInput {
    const where: Prisma.CourseModuleWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.courseId) {
      where.courseId = filters.courseId;
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
