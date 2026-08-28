import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';
import {
  addUtcDays,
  durationMinutes,
  getPeriodRange,
  parseDateOnly,
  startOfUtcDay,
} from './date.util';

export interface AttendanceReportQuery {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date?: string;
  from?: string;
  to?: string;
  batchId?: string;
  studentId?: string;
  facultyId?: string;
  status?: AttendanceStatus;
}

@Injectable()
export class BranchAttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
  ) {}

  async upsertAttendance(
    user: BranchAuthUser,
    input: {
      batchId: string;
      studentId: string;
      date: string;
      status: AttendanceStatus;
      punchIn?: string;
      punchOut?: string;
      remarks?: string;
    },
  ) {
    await this.access.assertFacultyCanAccessBatch(user, input.batchId);
    await this.access.assertFacultyCanAccessStudent(
      user,
      input.studentId,
      input.batchId,
    );

    const date = this.parseDate(input.date);
    const punchIn = input.punchIn ? new Date(input.punchIn) : undefined;
    const punchOut = input.punchOut ? new Date(input.punchOut) : undefined;

    if (punchIn && Number.isNaN(punchIn.getTime())) {
      throw new BadRequestException('Invalid punch in time');
    }

    if (punchOut && Number.isNaN(punchOut.getTime())) {
      throw new BadRequestException('Invalid punch out time');
    }

    if (punchIn && punchOut && punchOut < punchIn) {
      throw new BadRequestException(
        'Punch out cannot be before punch in',
      );
    }

    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_batchId_date: {
          studentId: input.studentId,
          batchId: input.batchId,
          date,
        },
      },
    });

    const duration =
      punchIn && punchOut
        ? durationMinutes(punchIn, punchOut)
        : existing?.punchIn && punchOut
          ? durationMinutes(existing.punchIn, punchOut)
          : punchIn && existing?.punchOut
            ? durationMinutes(punchIn, existing.punchOut)
            : existing?.durationMinutes ?? null;

    const record = existing
      ? await this.prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status: input.status,
            facultyId: this.access.isFaculty(user)
              ? user.sub
              : existing.facultyId,
            punchIn: punchIn ?? existing.punchIn,
            punchOut: punchOut ?? existing.punchOut,
            durationMinutes: duration,
            remarks: input.remarks ?? existing.remarks,
            updatedBy: user.sub,
          },
        })
      : await this.prisma.attendance.create({
          data: {
            branchId: user.branchId,
            batchId: input.batchId,
            studentId: input.studentId,
            facultyId: user.sub,
            date,
            status: input.status,
            punchIn,
            punchOut,
            durationMinutes: duration,
            remarks: input.remarks,
            createdBy: user.sub,
            updatedBy: user.sub,
          },
        });

    await this.access.log({
      user,
      action: existing ? 'ATTENDANCE_UPDATED' : 'ATTENDANCE_RECORDED',
      resourceType: 'Attendance',
      resourceId: record.id,
      metadata: {
        studentId: input.studentId,
        batchId: input.batchId,
        date: input.date,
        status: input.status,
      },
    });

    return record;
  }

  async punch(
    user: BranchAuthUser,
    input: {
      batchId: string;
      studentId: string;
      type: 'IN' | 'OUT';
      date?: string;
    },
  ) {
    await this.access.assertFacultyCanAccessBatch(user, input.batchId);
    await this.access.assertFacultyCanAccessStudent(
      user,
      input.studentId,
      input.batchId,
    );

    const date = input.date
      ? this.parseDate(input.date)
      : startOfUtcDay(new Date());
    const now = new Date();

    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_batchId_date: {
          studentId: input.studentId,
          batchId: input.batchId,
          date,
        },
      },
    });

    if (input.type === 'IN') {
      if (existing?.punchIn) {
        throw new BadRequestException(
          'Student already punched in today',
        );
      }

      return this.upsertAttendance(user, {
        batchId: input.batchId,
        studentId: input.studentId,
        date: date.toISOString().slice(0, 10),
        status: AttendanceStatus.PRESENT,
        punchIn: now.toISOString(),
        punchOut: existing?.punchOut?.toISOString(),
      });
    }

    if (!existing?.punchIn) {
      throw new BadRequestException(
        'Student has not punched in today',
      );
    }

    if (existing.punchOut) {
      throw new BadRequestException(
        'Student already punched out today',
      );
    }

    return this.upsertAttendance(user, {
      batchId: input.batchId,
      studentId: input.studentId,
      date: date.toISOString().slice(0, 10),
      status: existing.status,
      punchOut: now.toISOString(),
    });
  }

  async list(user: BranchAuthUser, query: AttendanceReportQuery) {
    const where = await this.buildWhere(user, query);

    const records = await this.prisma.attendance.findMany({
      where,
      include: {
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
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map((row) => this.toAttendanceDto(row));
  }

  async report(user: BranchAuthUser, query: AttendanceReportQuery) {
    const items = await this.list(user, query);
    const totals = {
      present: items.filter((item) => item.status === 'PRESENT').length,
      absent: items.filter((item) => item.status === 'ABSENT').length,
      late: items.filter((item) => item.status === 'LATE').length,
      leave: items.filter((item) => item.status === 'LEAVE').length,
    };

    return { totals, items };
  }

  private async buildWhere(
    user: BranchAuthUser,
    query: AttendanceReportQuery,
  ): Promise<Prisma.AttendanceWhereInput> {
    const where: Prisma.AttendanceWhereInput = {
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
          'Faculty cannot view another faculty member attendance',
          403,
        );
      }
      where.facultyId = query.facultyId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      const from = query.from
        ? this.parseDate(query.from)
        : undefined;
      const to = query.to
        ? addUtcDays(this.parseDate(query.to), 1)
        : undefined;
      where.date = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lt: to } : {}),
      };
    } else {
      const period = query.period ?? 'daily';
      const reference = query.date
        ? this.parseDate(query.date)
        : startOfUtcDay(new Date());
      const range = getPeriodRange(period, reference);
      where.date = { gte: range.from, lt: range.to };
    }

    return where;
  }

  private parseDate(value: string): Date {
    try {
      return parseDateOnly(value);
    } catch {
      throw new BadRequestException('Invalid date');
    }
  }

  private toAttendanceDto(
    row: Prisma.AttendanceGetPayload<{
      include: {
        student: {
          select: {
            id: true;
            firstName: true;
            lastName: true;
            studentCode: true;
          };
        };
        batch: { select: { id: true; name: true } };
        faculty: {
          select: { id: true; firstName: true; lastName: true };
        };
      };
    }>,
  ) {
    return {
      id: row.id,
      date: row.date,
      status: row.status,
      punchIn: row.punchIn,
      punchOut: row.punchOut,
      durationMinutes: row.durationMinutes,
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
