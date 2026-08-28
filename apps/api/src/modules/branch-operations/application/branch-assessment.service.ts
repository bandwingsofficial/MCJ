import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssessmentType, Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';
import { addUtcDays, parseDateOnly } from './date.util';

export interface AssessmentListQuery {
  batchId?: string;
  studentId?: string;
  facultyId?: string;
  type?: AssessmentType;
  from?: string;
  to?: string;
}

@Injectable()
export class BranchAssessmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
  ) {}

  async create(
    user: BranchAuthUser,
    input: {
      batchId: string;
      studentId: string;
      type: AssessmentType;
      name: string;
      date: string;
      maxMarks: number;
      obtainedMarks: number;
      remarks?: string;
    },
  ) {
    this.assertMarks(input.maxMarks, input.obtainedMarks);
    await this.access.assertFacultyCanAccessBatch(user, input.batchId);
    await this.access.assertFacultyCanAccessStudent(
      user,
      input.studentId,
      input.batchId,
    );

    const record = await this.prisma.academicAssessment.create({
      data: {
        branchId: user.branchId,
        batchId: input.batchId,
        studentId: input.studentId,
        facultyId: user.sub,
        type: input.type,
        name: input.name.trim(),
        date: this.parseDate(input.date),
        maxMarks: input.maxMarks,
        obtainedMarks: input.obtainedMarks,
        remarks: input.remarks,
        createdBy: user.sub,
        updatedBy: user.sub,
      },
    });

    await this.access.log({
      user,
      action: 'ASSESSMENT_CREATED',
      resourceType: 'AcademicAssessment',
      resourceId: record.id,
      metadata: {
        type: input.type,
        name: input.name,
        obtainedMarks: input.obtainedMarks,
        maxMarks: input.maxMarks,
      },
    });

    return this.findById(user, record.id);
  }

  async update(
    user: BranchAuthUser,
    id: string,
    input: {
      name?: string;
      date?: string;
      maxMarks?: number;
      obtainedMarks?: number;
      remarks?: string;
      type?: AssessmentType;
    },
  ) {
    const existing = await this.prisma.academicAssessment.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Assessment not found');
    }

    if (existing.branchId !== user.branchId) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ACCESS_DENIED,
        'Branch access denied',
        403,
      );
    }

    await this.access.assertFacultyCanAccessBatch(user, existing.batchId);

    if (this.access.isFaculty(user) && existing.facultyId !== user.sub) {
      throw new BaseException(
        ERROR_CODES.PERMISSION_DENIED,
        'Faculty cannot edit another faculty assessment',
        403,
      );
    }

    const maxMarks = input.maxMarks ?? Number(existing.maxMarks);
    const obtainedMarks =
      input.obtainedMarks ?? Number(existing.obtainedMarks);
    this.assertMarks(maxMarks, obtainedMarks);

    await this.prisma.academicAssessment.update({
      where: { id },
      data: {
        name: input.name?.trim() ?? existing.name,
        date: input.date ? this.parseDate(input.date) : existing.date,
        type: input.type ?? existing.type,
        maxMarks,
        obtainedMarks,
        remarks: input.remarks ?? existing.remarks,
        updatedBy: user.sub,
      },
    });

    await this.access.log({
      user,
      action: 'ASSESSMENT_UPDATED',
      resourceType: 'AcademicAssessment',
      resourceId: id,
      metadata: { maxMarks, obtainedMarks },
    });

    return this.findById(user, id);
  }

  async list(user: BranchAuthUser, query: AssessmentListQuery) {
    const where: Prisma.AcademicAssessmentWhereInput = {
      branchId: user.branchId,
    };

    if (this.access.isFaculty(user)) {
      const batchIds = await this.access.getAssignedBatchIds(user);
      where.batchId = { in: batchIds.length ? batchIds : ['__none__'] };
    }

    if (query.batchId) {
      await this.access.assertFacultyCanAccessBatch(user, query.batchId);
      where.batchId = query.batchId;
    }

    if (query.studentId) {
      await this.access.assertFacultyCanAccessStudent(
        user,
        query.studentId,
        query.batchId,
      );
      where.studentId = query.studentId;
    }

    if (query.facultyId) {
      if (this.access.isFaculty(user) && query.facultyId !== user.sub) {
        throw new BaseException(
          ERROR_CODES.PERMISSION_DENIED,
          'Faculty cannot view another faculty assessments',
          403,
        );
      }
      where.facultyId = query.facultyId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.from || query.to) {
      where.date = {
        ...(query.from ? { gte: this.parseDate(query.from) } : {}),
        ...(query.to
          ? { lt: addUtcDays(this.parseDate(query.to), 1) }
          : {}),
      };
    }

    const records = await this.prisma.academicAssessment.findMany({
      where,
      include: this.include(),
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map((row) => this.toDto(row));
  }

  async findById(user: BranchAuthUser, id: string) {
    const record = await this.prisma.academicAssessment.findFirst({
      where: { id },
      include: this.include(),
    });

    if (!record) {
      throw new NotFoundException('Assessment not found');
    }

    if (record.branchId !== user.branchId) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ACCESS_DENIED,
        'Branch access denied',
        403,
      );
    }

    await this.access.assertFacultyCanAccessBatch(user, record.batchId);

    return this.toDto(record);
  }

  private assertMarks(maxMarks: number, obtainedMarks: number) {
    if (maxMarks <= 0) {
      throw new BaseException(
        ERROR_CODES.INVALID_MARKS,
        'Maximum marks must be greater than zero',
        400,
      );
    }

    if (obtainedMarks < 0 || maxMarks < 0) {
      throw new BaseException(
        ERROR_CODES.INVALID_MARKS,
        'Marks cannot be negative',
        400,
      );
    }

    if (obtainedMarks > maxMarks) {
      throw new BaseException(
        ERROR_CODES.INVALID_MARKS,
        'Obtained marks cannot exceed maximum marks',
        400,
      );
    }
  }

  private parseDate(value: string): Date {
    try {
      return parseDateOnly(value);
    } catch {
      throw new BadRequestException('Invalid date');
    }
  }

  private include() {
    return {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentCode: true,
        },
      },
      batch: { select: { id: true, name: true } },
      faculty: {
        select: { id: true, firstName: true, lastName: true },
      },
    } as const;
  }

  private toDto(
    row: Prisma.AcademicAssessmentGetPayload<{
      include: ReturnType<BranchAssessmentService['include']>;
    }>,
  ) {
    const maxMarks = Number(row.maxMarks);
    const obtainedMarks = Number(row.obtainedMarks);

    return {
      id: row.id,
      type: row.type,
      name: row.name,
      date: row.date,
      maxMarks,
      obtainedMarks,
      percentage:
        maxMarks > 0
          ? Math.round((obtainedMarks / maxMarks) * 1000) / 10
          : 0,
      remarks: row.remarks,
      student: {
        id: row.student.id,
        name: [row.student.firstName, row.student.lastName]
          .filter(Boolean)
          .join(' '),
        studentCode: row.student.studentCode,
      },
      batch: row.batch,
      faculty: row.faculty
        ? {
            id: row.faculty.id,
            name: [row.faculty.firstName, row.faculty.lastName]
              .filter(Boolean)
              .join(' '),
          }
        : null,
    };
  }
}
