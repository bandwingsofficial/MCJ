import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Trainer } from '../../domain/entities/trainer.entity';
import { TrainerStatus } from '../../domain/enums/trainer-status.enum';
import {
  TrainerListFilters,
  TrainerRepository,
} from '../../domain/repositories/trainer.repository';
import { TrainerMapper } from '../mappers/trainer.mapper';

export class PrismaTrainerRepository implements TrainerRepository {
  private readonly logger = new Logger(PrismaTrainerRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async save(trainer: Trainer): Promise<void> {
    this.logger.log(`💾 Saving trainer: ${trainer.id}`);

    const data = TrainerMapper.toPersistence(trainer);

    await this.prisma.$transaction(async (tx) => {
      await tx.trainer.upsert({
        where: { id: trainer.id },
        update: { ...data },
        create: { ...data },
      });

      await tx.trainerCourse.deleteMany({
        where: { trainerId: trainer.id },
      });

      if (trainer.courses.length) {
        await tx.trainerCourse.createMany({
          data: trainer.courses.map((course) => ({
            id: course.id,
            trainerId: course.trainerId,
            courseId: course.courseId,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Trainer | null> {
    const record = await this.prisma.trainer.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? TrainerMapper.toDomain(record) : null;
  }

  async findByIdIncludingDeleted(
    id: string,
  ): Promise<Trainer | null> {
    return this.findById(id, true);
  }

  async findByEmail(
    email: string,
    includeDeleted = false,
  ): Promise<Trainer | null> {
    const record = await this.prisma.trainer.findFirst({
      where: {
        email,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? TrainerMapper.toDomain(record) : null;
  }

  async findByPhone(
    phone: string,
    includeDeleted = false,
  ): Promise<Trainer | null> {
    const record = await this.prisma.trainer.findFirst({
      where: {
        phone,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? TrainerMapper.toDomain(record) : null;
  }

  async findByEmployeeCode(
    employeeCode: string,
    includeDeleted = false,
  ): Promise<Trainer | null> {
    const record = await this.prisma.trainer.findFirst({
      where: {
        employeeCode,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? TrainerMapper.toDomain(record) : null;
  }

  async findAll(
    filters: TrainerListFilters = {},
  ): Promise<Trainer[]> {
    const records = await this.prisma.trainer.findMany({
      where: this.buildWhere(filters),
      include: this.includeRelations(),
      orderBy: [
        {
          displayOrder: {
            sort: 'asc',
            nulls: 'last',
          },
        },
        { createdAt: 'asc' },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(TrainerMapper.toDomain);
  }

  async count(filters: TrainerListFilters = {}): Promise<number> {
    return this.prisma.trainer.count({
      where: this.buildWhere(filters),
    });
  }

  async getMaxNumericSuffixForPrefix(prefix: string): Promise<number> {
    const normalized = prefix.trim().toUpperCase();

    if (!normalized) {
      return 0;
    }

    const records = await this.prisma.trainer.findMany({
      where: {
        employeeCode: {
          startsWith: normalized,
        },
      },
      select: {
        employeeCode: true,
      },
    });

    let max = 0;
    const pattern = new RegExp(
      `^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)$`,
    );

    for (const record of records) {
      if (!record.employeeCode) {
        continue;
      }

      const match = record.employeeCode.match(pattern);
      if (!match) {
        continue;
      }

      const value = Number(match[1]);
      if (!Number.isNaN(value) && value > max) {
        max = value;
      }
    }

    return max;
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.prisma.trainer.aggregate({
      where: {
        isDeleted: false,
        displayOrder: { not: null },
      },
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? 0;
  }

  async getMaxActiveDisplayOrder(): Promise<number> {
    const result = await this.prisma.trainer.aggregate({
      where: {
        isDeleted: false,
        status: TrainerStatus.ACTIVE,
        displayOrder: { not: null },
      },
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? 0;
  }

  async closeDisplayOrderGap(
    deletedDisplayOrder: number,
  ): Promise<void> {
    await this.prisma.trainer.updateMany({
      where: {
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

  async moveDisplayOrder(
    trainerId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        await tx.trainer.updateMany({
          where: {
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
        await tx.trainer.updateMany({
          where: {
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

      await tx.trainer.update({
        where: { id: trainerId },
        data: { displayOrder: newOrder },
      });
    });
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.trainer.delete({
      where: { id },
    });
  }

  private includeRelations() {
    return {
      branch: true,
      courses: {
        orderBy: { createdAt: 'desc' as const },
        include: {
          course: true,
        },
      },
    };
  }

  private buildWhere(
    filters: TrainerListFilters,
  ): Prisma.TrainerWhereInput {
    const where: Prisma.TrainerWhereInput = {};

    if (filters.isDeleted === true) {
      where.isDeleted = true;
    } else if (filters.isDeleted === false) {
      where.isDeleted = false;
    } else if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.onlyActive) {
      where.status = TrainerStatus.ACTIVE;
    } else if (filters.status) {
      where.status = filters.status;
    }

    if (filters.branchId !== undefined) {
      where.branchId = filters.branchId;
    }

    if (filters.trainerType) {
      where.trainerType = filters.trainerType;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.search) {
      where.OR = [
        {
          firstName: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          employeeCode: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }
}
