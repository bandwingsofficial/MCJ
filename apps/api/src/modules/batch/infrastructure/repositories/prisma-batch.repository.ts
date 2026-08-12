import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Batch } from '../../domain/entities/batch.entity';
import {
  BatchListFilters,
  BatchRepository,
} from '../../domain/repositories/batch.repository';
import { BatchMapper } from '../mappers/batch.mapper';

export class PrismaBatchRepository implements BatchRepository {
  private readonly logger = new Logger(PrismaBatchRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async save(batch: Batch): Promise<void> {
    this.logger.log(`💾 Saving batch: ${batch.id}`);

    const data = BatchMapper.toPersistence(batch);

    await this.prisma.$transaction(async (tx) => {
      await tx.batch.upsert({
        where: { id: batch.id },
        update: { ...data },
        create: { ...data },
      });

      await tx.batchTrainer.deleteMany({
        where: { batchId: batch.id },
      });

      if (batch.trainers.length) {
        await tx.batchTrainer.createMany({
          data: batch.trainers.map((trainer) => ({
            id: trainer.id,
            batchId: trainer.batchId,
            trainerId: trainer.trainerId,
            createdAt: trainer.createdAt,
            updatedAt: trainer.updatedAt,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Batch | null> {
    const record = await this.prisma.batch.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? BatchMapper.toDomain(record) : null;
  }

  async findByCode(
    code: string,
    includeDeleted = false,
  ): Promise<Batch | null> {
    const record = await this.prisma.batch.findFirst({
      where: {
        code,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? BatchMapper.toDomain(record) : null;
  }

  async findBySlug(
  slug: string,
  includeDeleted = false,
): Promise<Batch | null> {
  const record = await this.prisma.batch.findFirst({
    where: {
      slug,
      ...(includeDeleted ? {} : { isDeleted: false }),
    },
    include: this.includeRelations(),
  });

  return record ? BatchMapper.toDomain(record) : null;
}

  async findAll(
    filters: BatchListFilters = {},
  ): Promise<Batch[]> {
    const records = await this.prisma.batch.findMany({
      where: this.buildWhere(filters),
      include: this.includeRelations(),
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(BatchMapper.toDomain);
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.batch.delete({
      where: { id },
    });
  }

private includeRelations() {
  return {
    course: {
      select: {
        id: true,
        title: true,
        slug: true,
      },
    },

    branch: {
      select: {
        id: true,
        branchName: true,
        branchCode: true,
      },
    },

    trainers: {
      orderBy: { createdAt: 'desc' as const },
      include: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    },
  };
}

  private buildWhere(
    filters: BatchListFilters,
  ): Prisma.BatchWhereInput {
    const where: Prisma.BatchWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.onlyActive) {
      where.isActive = true;
    } else if (filters.status) {
      where.status = filters.status;
    }

    if (filters.courseId) where.courseId = filters.courseId;
    if (filters.branchId !== undefined) where.branchId = filters.branchId;
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
