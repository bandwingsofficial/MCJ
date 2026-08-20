import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Student } from '../../domain/entities/student.entity';
import { StudentStatus } from '../../domain/enums/student-status.enum';
import {
  StudentListFilters,
  StudentRepository,
} from '../../domain/repositories/student.repository';
import { StudentMapper } from '../mappers/student.mapper';
import { parseStudentCodeNumber } from '../../domain/utils/student-code.util';

export class PrismaStudentRepository
  implements StudentRepository
{
  private readonly logger = new Logger(
    PrismaStudentRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(student: Student): Promise<void> {
    this.logger.log(`💾 Saving student: ${student.id}`);

    const data = StudentMapper.toPersistence(student);

    await this.prisma.student.upsert({
      where: { id: student.id },
      update: { ...data },
      create: { ...data },
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Student | null> {
    const record = await this.prisma.student.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? StudentMapper.toDomain(record) : null;
  }

  async findByUserId(
  userId: string,
  includeDeleted = false,
): Promise<Student | null> {
  const record = await this.prisma.student.findFirst({
    where: {
      userId,
      ...(includeDeleted ? {} : { isDeleted: false }),
    },
  });

  return record ? StudentMapper.toDomain(record) : null;
}

  async findByEmail(
    email: string,
    includeDeleted = false,
  ): Promise<Student | null> {
    const record = await this.prisma.student.findFirst({
      where: {
        email,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? StudentMapper.toDomain(record) : null;
  }

  async findByPhone(
    phone: string,
    includeDeleted = false,
  ): Promise<Student | null> {
    const record = await this.prisma.student.findFirst({
      where: {
        phone,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? StudentMapper.toDomain(record) : null;
  }

  async findByStudentCode(
    studentCode: string,
    includeDeleted = false,
  ): Promise<Student | null> {
    const record = await this.prisma.student.findFirst({
      where: {
        studentCode,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? StudentMapper.toDomain(record) : null;
  }

  async findByCreatedBy(
    createdBy: string,
    includeDeleted = false,
  ): Promise<Student | null> {
    const record = await this.prisma.student.findFirst({
      where: {
        createdBy,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return record ? StudentMapper.toDomain(record) : null;
  }

  async findAll(
    filters: StudentListFilters = {},
  ): Promise<Student[]> {
    const records = await this.prisma.student.findMany({
      where: this.buildWhere(filters),
      orderBy: [
        { admissionDate: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(StudentMapper.toDomain);
  }

  async count(filters: StudentListFilters = {}): Promise<number> {
    return this.prisma.student.count({
      where: this.buildWhere(filters),
    });
  }

  async getMaxStudentCodeNumber(): Promise<number> {
    const records = await this.prisma.student.findMany({
      where: {
        studentCode: {
          startsWith: 'STU',
        },
      },
      select: {
        studentCode: true,
      },
    });

    let max = 0;

    for (const record of records) {
      const value = parseStudentCodeNumber(record.studentCode);

      if (value !== null && value > max) {
        max = value;
      }
    }

    return max;
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.student.delete({
      where: { id },
    });
  }

  private buildWhere(
    filters: StudentListFilters,
  ): Prisma.StudentWhereInput {
    const where: Prisma.StudentWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.onlyActive) {
      where.isActive = true;
    } else if (filters.status) {
      where.status = filters.status;
    }

    if (filters.branchId !== undefined) {
      where.branchId = filters.branchId;
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
          studentCode: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }
}
