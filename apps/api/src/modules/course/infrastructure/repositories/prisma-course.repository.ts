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
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(CourseMapper.toDomain);
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
