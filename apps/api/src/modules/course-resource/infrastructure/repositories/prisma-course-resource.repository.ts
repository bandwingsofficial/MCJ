import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { reorderIdsByRank } from '../../../../common/utils/reorder-by-rank.util';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { CourseResource } from '../../domain/entities/course-resource.entity';
import {
  CourseResourceListFilters,
  CourseResourceRepository,
} from '../../domain/repositories/course-resource.repository';
import { CourseResourceMapper } from '../mappers/course-resource.mapper';

export class PrismaCourseResourceRepository
  implements CourseResourceRepository
{
  private readonly logger = new Logger(
    PrismaCourseResourceRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(resource: CourseResource): Promise<void> {
    this.logger.log(`💾 Saving course resource: ${resource.id}`);

    const data = CourseResourceMapper.toPersistence(resource);

    await this.prisma.courseResource.upsert({
      where: { id: resource.id },
      update: { ...data },
      create: { ...data },
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<CourseResource | null> {
    const record = await this.prisma.courseResource.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CourseResourceMapper.toDomain(record) : null;
  }

  async findByLessonId(
    lessonId: string,
    includeDeleted = false,
  ): Promise<CourseResource[]> {
    const records = await this.prisma.courseResource.findMany({
      where: {
        lessonId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return records.map(CourseResourceMapper.toDomain);
  }

  async findAll(
    filters: CourseResourceListFilters = {},
  ): Promise<CourseResource[]> {
    const records = await this.prisma.courseResource.findMany({
      where: this.buildWhere(filters),
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(CourseResourceMapper.toDomain);
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.courseResource.delete({
      where: { id },
    });
  }

  async getMaxDisplayOrder(lessonId: string): Promise<number> {
    const result = await this.prisma.courseResource.aggregate({
      where: {
        lessonId,
        isDeleted: false,
      },
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? 0;
  }

  async shiftDisplayOrders(
    lessonId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    if (newOrder < oldOrder) {
      await this.prisma.courseResource.updateMany({
        where: {
          lessonId,
          isDeleted: false,
          displayOrder: { gte: newOrder, lt: oldOrder },
        },
        data: { displayOrder: { increment: 1 } },
      });
    } else {
      await this.prisma.courseResource.updateMany({
        where: {
          lessonId,
          isDeleted: false,
          displayOrder: { gt: oldOrder, lte: newOrder },
        },
        data: { displayOrder: { decrement: 1 } },
      });
    }
  }

  async closeDisplayOrderGap(
    lessonId: string,
    deletedDisplayOrder: number,
  ): Promise<void> {
    await this.prisma.courseResource.updateMany({
      where: {
        lessonId,
        isDeleted: false,
        displayOrder: { gt: deletedDisplayOrder },
      },
      data: { displayOrder: { decrement: 1 } },
    });
  }

  async move(
    id: string,
    lessonId: string,
    _oldOrder: number,
    newOrder: number,
    updatedBy?: string | null,
  ): Promise<void> {
    const siblings = await this.prisma.courseResource.findMany({
      where: {
        lessonId,
        isDeleted: false,
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    });

    const orderedIds = siblings.map((row) => row.id);
    const reorderedIds = reorderIdsByRank(orderedIds, id, newOrder);

    if (reorderedIds === orderedIds) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < reorderedIds.length; index += 1) {
        const siblingId = reorderedIds[index];
        await tx.courseResource.update({
          where: { id: siblingId },
          data: {
            displayOrder: index + 1,
            ...(siblingId === id
              ? {
                  updatedBy: updatedBy ?? undefined,
                  updatedAt: new Date(),
                }
              : {}),
          },
        });
      }
    });
  }

  private buildWhere(
    filters: CourseResourceListFilters,
  ): Prisma.CourseResourceWhereInput {
    const where: Prisma.CourseResourceWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.lessonId) {
      where.lessonId = filters.lessonId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return where;
  }
}
