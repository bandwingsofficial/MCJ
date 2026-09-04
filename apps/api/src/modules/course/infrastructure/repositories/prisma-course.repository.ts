import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Course } from '../../domain/entities/course.entity';
import { CourseStatus } from '../../domain/enums/course-status.enum';
import {
  CourseListFilters,
  CourseRepository,
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
        { createdAt: 'asc' },
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

  async findTrainersByCourseId(courseId: string) {
    const links = await this.prisma.trainerCourse.findMany({
      where: { courseId },
      include: {
        trainer: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return links
      .filter((link) => link.trainer && !link.trainer.isDeleted)
      .map((link) => ({
        id: link.trainer.id,
        firstName: link.trainer.firstName,
        lastName: link.trainer.lastName,
        employeeCode: link.trainer.employeeCode,
        qualification: link.trainer.qualification,
        specialization: link.trainer.specialization,
        status: link.trainer.status,
        profileImageUrl: link.trainer.profileImageUrl,
        email: link.trainer.email,
      }));
  }

  async syncTrainers(courseId: string, trainerIds: string[]): Promise<void> {
    const uniqueIds = Array.from(
      new Set(trainerIds.map((id) => id.trim()).filter(Boolean)),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.trainerCourse.deleteMany({
        where: { courseId },
      });

      if (!uniqueIds.length) {
        return;
      }

      await tx.trainerCourse.createMany({
        data: uniqueIds.map((trainerId) => ({
          trainerId,
          courseId,
        })),
        skipDuplicates: true,
      });
    });
  }

  async areNewTrainersActive(
    courseId: string,
    trainerIds: string[],
  ): Promise<boolean> {
    const uniqueIds = Array.from(
      new Set(trainerIds.map((id) => id.trim()).filter(Boolean)),
    );

    if (!uniqueIds.length) {
      return true;
    }

    const existing = await this.prisma.trainerCourse.findMany({
      where: { courseId },
      select: { trainerId: true },
    });
    const existingIds = new Set(existing.map((row) => row.trainerId));
    const newIds = uniqueIds.filter((id) => !existingIds.has(id));

    if (!newIds.length) {
      return true;
    }

    const count = await this.prisma.trainer.count({
      where: {
        id: { in: newIds },
        isDeleted: false,
        status: 'ACTIVE',
      },
    });

    return count === newIds.length;
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
