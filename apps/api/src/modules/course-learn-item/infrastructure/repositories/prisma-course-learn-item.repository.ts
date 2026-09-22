import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { reorderIdsByRank } from '../../../../common/utils/reorder-by-rank.util';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { CourseLearnItem } from '../../domain/entities/course-learn-item.entity';
import {
  CourseLearnItemListFilters,
  CourseLearnItemRepository,
} from '../../domain/repositories/course-learn-item.repository';
import { CourseLearnItemMapper } from '../mappers/course-learn-item.mapper';

export class PrismaCourseLearnItemRepository
  implements CourseLearnItemRepository
{
  private readonly logger = new Logger(
    PrismaCourseLearnItemRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(item: CourseLearnItem): Promise<void> {
    this.logger.log(`💾 Saving course learn item: ${item.id}`);

    const data = CourseLearnItemMapper.toPersistence(item);

    await this.prisma.courseLearnItem.upsert({
      where: { id: item.id },
      update: { ...data },
      create: { ...data },
    });
  }

  async findById(id: string): Promise<CourseLearnItem | null> {
    const record = await this.prisma.courseLearnItem.findUnique({
      where: { id },
    });

    return record ? CourseLearnItemMapper.toDomain(record) : null;
  }

  async findByLessonId(lessonId: string): Promise<CourseLearnItem[]> {
    const records = await this.prisma.courseLearnItem.findMany({
      where: { lessonId },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return records.map(CourseLearnItemMapper.toDomain);
  }

  async findAll(
    filters: CourseLearnItemListFilters = {},
  ): Promise<CourseLearnItem[]> {
    const records = await this.prisma.courseLearnItem.findMany({
      where: this.buildWhere(filters),
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(CourseLearnItemMapper.toDomain);
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.courseLearnItem.delete({
      where: { id },
    });
  }

  async getMaxDisplayOrder(lessonId: string): Promise<number> {
    const result = await this.prisma.courseLearnItem.aggregate({
      where: { lessonId },
      _max: { displayOrder: true },
    });

    return result._max.displayOrder ?? 0;
  }

  async closeDisplayOrderGap(
    lessonId: string,
    deletedDisplayOrder: number,
  ): Promise<void> {
    await this.prisma.courseLearnItem.updateMany({
      where: {
        lessonId,
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
    const siblings = await this.prisma.courseLearnItem.findMany({
      where: { lessonId },
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
        await tx.courseLearnItem.update({
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
    filters: CourseLearnItemListFilters,
  ): Prisma.CourseLearnItemWhereInput {
    const where: Prisma.CourseLearnItemWhereInput = {};

    if (filters.lessonId) {
      where.lessonId = filters.lessonId;
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
          explanation: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }
}
