import { Logger } from '@nestjs/common';
import { Prisma, TrainerStatus } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Course } from '../../domain/entities/course.entity';
import { CourseStatus } from '../../domain/enums/course-status.enum';
import {
  CourseListFilters,
  CourseRepository,
  CourseTrainerRecord,
} from '../../domain/repositories/course.repository';
import { CourseMapper } from '../mappers/course.mapper';

export class PrismaCourseRepository
  implements CourseRepository
{
  private readonly logger = new Logger(
    PrismaCourseRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(course: Course): Promise<void> {
    this.logger.log(`💾 Saving course: ${course.id}`);

    const data = CourseMapper.toPersistence(course);

    await this.prisma.$transaction(async (tx) => {
      await tx.course.upsert({
        where: { id: course.id },
        update: {
          ...data,
        },
        create: {
          ...data,
        },
      });

      await tx.courseBranch.deleteMany({
  where: {
    courseId: course.id,
  },
});

if (course.branchIds.length) {
  await tx.courseBranch.createMany({
    data: course.branchIds.map((branchId) => ({
      courseId: course.id,
      branchId,
    })),
  });
}

      await tx.courseImage.deleteMany({
        where: { courseId: course.id },
      });

      if (course.images.length) {
        await tx.courseImage.createMany({
          data: course.images.map((image) => ({
            id: image.id,
            courseId: image.courseId,
            fileId: image.fileId,
            displayOrder: image.displayOrder,
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
          })),
        });
      }

      await tx.courseMaterial.deleteMany({
        where: { courseId: course.id },
      });

      if (course.materials.length) {
        await tx.courseMaterial.createMany({
          data: course.materials.map((material) => ({
            id: material.id,
            courseId: material.courseId,
            title: material.title,
            type: material.type,
            fileId: material.fileId,
            externalUrl: material.externalUrl,
            displayOrder: material.displayOrder,
            createdAt: material.createdAt,
            updatedAt: material.updatedAt,
          })),
        });
      }
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Course | null> {
    const record = await this.prisma.course.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? CourseMapper.toDomain(record) : null;
  }

  async findByIdIncludingDeleted(
    id: string,
  ): Promise<Course | null> {
    return this.findById(id, true);
  }

  async findBySlug(
    slug: string,
    includeDeleted = false,
  ): Promise<Course | null> {
    const record = await this.prisma.course.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? CourseMapper.toDomain(record) : null;
  }

  async findAll(
    filters: CourseListFilters = {},
  ): Promise<Course[]> {
    const records = await this.prisma.course.findMany({
      where: this.buildWhere(filters),
      include: this.includeRelations(),
      orderBy: [
        {
          displayOrder: {
            sort: 'asc',
            nulls: 'last',
          },
        },
        { createdAt: 'desc' },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(CourseMapper.toDomain);
  }

  async count(filters: CourseListFilters = {}): Promise<number> {
    return this.prisma.course.count({
      where: this.buildWhere(filters),
    });
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.prisma.course.aggregate({
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
    const result = await this.prisma.course.aggregate({
      where: {
        isDeleted: false,
        status: CourseStatus.ACTIVE,
        displayOrder: { not: null },
      },
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? 0;
  }

  async getMaxCourseCodeNumber(): Promise<number> {
    const records = await this.prisma.course.findMany({
      where: {
        code: {
          startsWith: 'CR',
        },
      },
      select: {
        code: true,
      },
    });

    let max = 0;

    for (const record of records) {
      const match = record.code.match(/^CR(\d{4})$/i);

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

  async existsByCourseCode(
    courseCode: string,
    excludeId?: string,
  ): Promise<boolean> {
    const normalized = courseCode.trim().toUpperCase();

    const count = await this.prisma.course.count({
      where: {
        code: normalized,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    return count > 0;
  }

  async closeDisplayOrderGap(
    deletedDisplayOrder: number,
  ): Promise<void> {
    await this.prisma.course.updateMany({
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
    courseId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        await tx.course.updateMany({
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
        await tx.course.updateMany({
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

      await tx.course.update({
        where: { id: courseId },
        data: { displayOrder: newOrder },
      });
    });
  }

  async getManagementCounts(courseId: string): Promise<{
    batches: number;
    students: number;
    instructors: number;
    branches: number;
    modules: number;
    lessons: number;
    quizzes: number;
  }> {
    const [
      batches,
      students,
      instructors,
      branches,
      modules,
      lessons,
      quizzes,
    ] = await Promise.all([
      this.prisma.batch.count({
        where: { courseId, isDeleted: false },
      }),
      this.prisma.enrollment.count({
        where: { courseId, isDeleted: false },
      }),
      this.prisma.trainerCourse.count({
        where: { courseId },
      }),
      this.prisma.courseBranch.count({
        where: { courseId },
      }),
      this.prisma.courseModule.count({
        where: { courseId, isDeleted: false },
      }),
      this.prisma.courseLesson.count({
        where: {
          isDeleted: false,
          module: {
            courseId,
            isDeleted: false,
          },
        },
      }),
      this.prisma.courseQuiz.count({
        where: {
          isDeleted: false,
          lesson: {
            isDeleted: false,
            module: {
              courseId,
              isDeleted: false,
            },
          },
        },
      }),
    ]);

    return {
      batches,
      students,
      instructors,
      branches,
      modules,
      lessons,
      quizzes,
    };
  }

  async findAssignedTrainers(
    courseId: string,
  ): Promise<CourseTrainerRecord[]> {
    const rows = await this.prisma.trainerCourse.findMany({
      where: { courseId },
      include: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            specialization: true,
            phone: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => ({
      id: row.trainer.id,
      firstName: row.trainer.firstName,
      lastName: row.trainer.lastName,
      employeeCode: row.trainer.employeeCode,
      specialization: row.trainer.specialization,
      phone: row.trainer.phone,
      status: row.trainer.status,
    }));
  }

  async findAvailableActiveTrainers(
    courseId: string,
  ): Promise<CourseTrainerRecord[]> {
    const assigned = await this.prisma.trainerCourse.findMany({
      where: { courseId },
      select: { trainerId: true },
    });
    const assignedIds = assigned.map((row) => row.trainerId);

    const trainers = await this.prisma.trainer.findMany({
      where: {
        status: TrainerStatus.ACTIVE,
        isDeleted: false,
        ...(assignedIds.length > 0
          ? { id: { notIn: assignedIds } }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        specialization: true,
        phone: true,
        status: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    return trainers.map((trainer) => ({
      id: trainer.id,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      employeeCode: trainer.employeeCode,
      specialization: trainer.specialization,
      phone: trainer.phone,
      status: trainer.status,
    }));
  }

  async assignTrainersToCourse(
    courseId: string,
    trainerIds: string[],
  ): Promise<number> {
    const uniqueIds = Array.from(new Set(trainerIds));

    if (uniqueIds.length === 0) {
      return 0;
    }

    const trainers = await this.prisma.trainer.findMany({
      where: {
        id: { in: uniqueIds },
        isDeleted: false,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (trainers.length !== uniqueIds.length) {
      throw new BaseException(
        ERROR_CODES.TRAINER_NOT_FOUND,
        'One or more trainers were not found',
        404,
      );
    }

    const inactiveTrainer = trainers.find(
      (trainer) => trainer.status !== TrainerStatus.ACTIVE,
    );

    if (inactiveTrainer) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only active trainers can be assigned to a course',
        400,
      );
    }

    const existing = await this.prisma.trainerCourse.findMany({
      where: {
        courseId,
        trainerId: { in: uniqueIds },
      },
      select: { trainerId: true },
    });
    const existingIds = new Set(
      existing.map((row) => row.trainerId),
    );
    const toCreate = uniqueIds.filter((id) => !existingIds.has(id));

    if (toCreate.length === 0) {
      return 0;
    }

    await this.prisma.trainerCourse.createMany({
      data: toCreate.map((trainerId) => ({
        trainerId,
        courseId,
      })),
      skipDuplicates: true,
    });

    return toCreate.length;
  }

  async removeTrainerFromCourse(
    courseId: string,
    trainerId: string,
  ): Promise<void> {
    const result = await this.prisma.trainerCourse.deleteMany({
      where: {
        courseId,
        trainerId,
      },
    });

    if (result.count === 0) {
      throw new BaseException(
        ERROR_CODES.TRAINER_NOT_FOUND,
        'Trainer is not assigned to this course',
        404,
      );
    }
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.course.delete({
      where: { id },
    });
  }

  private includeRelations() {
  return {
    images: {
      orderBy: { displayOrder: 'asc' as const },
    },
    materials: {
      orderBy: { displayOrder: 'asc' as const },
    },
    courseBranches: true,
  };
}

  private buildWhere(
    filters: CourseListFilters,
  ): Prisma.CourseWhereInput {
    const where: Prisma.CourseWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.onlyActive) {
      where.status = CourseStatus.ACTIVE;
    } else if (filters.status) {
      where.status = filters.status;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.branchId) {
  where.courseBranches = {
    some: {
      branchId: filters.branchId,
    },
  };
}

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.isPopular !== undefined) {
      where.isPopular = filters.isPopular;
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
