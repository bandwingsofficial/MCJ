import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentAlreadyExistsException } from '../../domain/errors/enrollment-already-exists.exception';
import {
  EnrollmentDetailView,
  EnrollmentListFilters,
  EnrollmentRepository,
  EnrollmentSummaryView,
} from '../../domain/repositories/enrollment.repository';
import { EnrollmentMapper } from '../mappers/enrollment.mapper';
import {
  enrollmentDetailInclude,
  EnrollmentResponseMapper,
} from '../mappers/enrollment-response.mapper';

export class PrismaEnrollmentRepository
  implements EnrollmentRepository
{
  private readonly logger = new Logger(
    PrismaEnrollmentRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(enrollment: Enrollment): Promise<void> {
    this.logger.log(`💾 Saving enrollment: ${enrollment.id}`);

    const data = EnrollmentMapper.toPersistence(enrollment);

    try {
      await this.prisma.enrollment.upsert({
        where: { id: enrollment.id },
        update: { ...data },
        create: { ...data },
      });
    } catch (error) {
      await this.rethrowUniqueViolation(error, enrollment);
    }
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Enrollment | null> {
    const record = await this.prisma.enrollment.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? EnrollmentMapper.toDomain(record) : null;
  }

  async findByEnrollmentNumber(
    enrollmentNumber: string,
    includeDeleted = false,
  ): Promise<Enrollment | null> {
    const record = await this.prisma.enrollment.findFirst({
      where: {
        enrollmentNumber,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? EnrollmentMapper.toDomain(record) : null;
  }

  async findByStudentAndBatch(
    studentId: string,
    batchId: string,
    includeDeleted = false,
  ): Promise<Enrollment | null> {
    const record = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        batchId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? EnrollmentMapper.toDomain(record) : null;
  }

  async findCurrentByStudentId(
    studentId: string,
    excludeId?: string,
  ): Promise<Enrollment | null> {
    const record = await this.prisma.enrollment.findFirst({
      where: this.currentEnrollmentWhere(studentId, excludeId),
      orderBy: { createdAt: 'asc' },
    });

    return record ? EnrollmentMapper.toDomain(record) : null;
  }

  async findCurrentDetailByStudentId(
    studentId: string,
    excludeId?: string,
  ): Promise<EnrollmentDetailView | null> {
    const record = await this.prisma.enrollment.findFirst({
      where: this.currentEnrollmentWhere(studentId, excludeId),
      include: enrollmentDetailInclude,
      orderBy: { createdAt: 'asc' },
    });

    return record
      ? EnrollmentResponseMapper.toDetail(record)
      : null;
  }

  async findDetailById(
    id: string,
    includeDeleted = false,
  ): Promise<EnrollmentDetailView | null> {
    const record = await this.prisma.enrollment.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: enrollmentDetailInclude,
    });

    return record
      ? EnrollmentResponseMapper.toDetail(record)
      : null;
  }

  async findDetailsByStudentId(
    studentId: string,
    includeDeleted = false,
  ): Promise<EnrollmentDetailView[]> {
    const records = await this.prisma.enrollment.findMany({
      where: {
        studentId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: enrollmentDetailInclude,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) =>
      EnrollmentResponseMapper.toDetail(record),
    );
  }

  async findAdmittedByStudentAndCourse(
    studentId: string,
    courseId: string,
    includeDeleted = false,
  ): Promise<EnrollmentDetailView | null> {
    const record = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        status: 'ADMITTED',
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: enrollmentDetailInclude,
      orderBy: { createdAt: 'desc' },
    });

    return record
      ? EnrollmentResponseMapper.toDetail(record)
      : null;
  }

  async findSummaries(
    filters: EnrollmentListFilters = {},
  ): Promise<EnrollmentSummaryView[]> {
    const records = await this.prisma.enrollment.findMany({
      where: this.buildWhere(filters),
      orderBy: this.buildOrderBy(filters),
      include: enrollmentDetailInclude,
      skip: filters.skip,
      take: filters.take,
    });

    return records.map((record) =>
      EnrollmentResponseMapper.toSummary(record),
    );
  }

  async count(
    filters: EnrollmentListFilters = {},
  ): Promise<number> {
    return this.prisma.enrollment.count({
      where: this.buildWhere(filters),
    });
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.enrollment.delete({
      where: { id },
    });
  }

  private buildOrderBy(
    filters: EnrollmentListFilters,
  ): Prisma.EnrollmentOrderByWithRelationInput {
    const sortOrder = filters.sortOrder ?? 'desc';

    const allowedSortFields = new Set([
      'createdAt',
      'admissionDate',
      'joiningDate',
      'finalAmount',
      'paidAmount',
      'dueAmount',
      'status',
      'paymentStatus',
    ]);

    const sortBy =
      filters.sortBy && allowedSortFields.has(filters.sortBy)
        ? filters.sortBy
        : 'createdAt';

    return { [sortBy]: sortOrder };
  }

  private buildWhere(
    filters: EnrollmentListFilters,
  ): Prisma.EnrollmentWhereInput {
    const where: Prisma.EnrollmentWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.studentId !== undefined) {
      where.studentId = filters.studentId;
    }

    if (filters.branchId !== undefined) {
      where.branchId = filters.branchId;
    }

    if (filters.categoryId !== undefined) {
      where.categoryId = filters.categoryId;
    }

    if (filters.courseId !== undefined) {
      where.courseId = filters.courseId;
    }

    if (filters.batchId !== undefined) {
      where.batchId = filters.batchId;
    }

    if (filters.status !== undefined) {
      where.status = filters.status;
    } else if (filters.currentOnly) {
      where.status = { in: Enrollment.currentStatuses() };
    }

    if (filters.paymentStatus !== undefined) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.source !== undefined) {
      where.source = filters.source;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (
      filters.admissionDateFrom !== undefined ||
      filters.admissionDateTo !== undefined
    ) {
      where.admissionDate = {
        ...(filters.admissionDateFrom !== undefined
          ? { gte: filters.admissionDateFrom }
          : {}),
        ...(filters.admissionDateTo !== undefined
          ? { lte: filters.admissionDateTo }
          : {}),
      };
    }

    if (
      filters.createdAtFrom !== undefined ||
      filters.createdAtTo !== undefined
    ) {
      where.createdAt = {
        ...(filters.createdAtFrom !== undefined
          ? { gte: filters.createdAtFrom }
          : {}),
        ...(filters.createdAtTo !== undefined
          ? { lte: filters.createdAtTo }
          : {}),
      };
    }

    if (filters.search) {
      const contains: Prisma.StringFilter = {
        contains: filters.search,
        mode: 'insensitive',
      };

      where.OR = [
        { enrollmentNumber: contains },
        { remarks: contains },
        { student: { studentCode: contains } },
        { student: { firstName: contains } },
        { student: { lastName: contains } },
        { student: { email: contains } },
        { student: { phone: contains } },
        { course: { title: contains } },
        { batch: { name: contains } },
        { branch: { branchName: contains } },
      ];
    }

    return where;
  }

  private currentEnrollmentWhere(
    studentId: string,
    excludeId?: string,
  ): Prisma.EnrollmentWhereInput {
    return {
      studentId,
      isDeleted: false,
      status: { in: Enrollment.currentStatuses() },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    };
  }

  private async rethrowUniqueViolation(
    error: unknown,
    enrollment: Enrollment,
  ): Promise<never> {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      throw error;
    }

    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(',')
      : String(error.meta?.target ?? '');

    if (target.toLowerCase().includes('enrollmentnumber')) {
      throw new EnrollmentAlreadyExistsException(
        ERROR_CODES.ENROLLMENT_ALREADY_EXISTS,
        'Enrollment number already exists',
      );
    }

    const existing = await this.findCurrentDetailByStudentId(
      enrollment.studentId,
      enrollment.id,
    );

    if (existing) {
      throw EnrollmentAlreadyExistsException.forCurrentEnrollment(
        existing,
        enrollment.batchId,
      );
    }

    throw new EnrollmentAlreadyExistsException();
  }
}
