import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BatchCalendarExceptionStatus,
  CourseMode,
  DayOfWeek,
  Prisma,
} from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import {
  BATCH_MODE_LABELS,
  BATCH_MODE_ORDER,
  type BatchCalendarDayCell,
  type BatchCalendarExceptionRecord,
  type BatchCalendarSummary,
  type BatchModeScheduleConfig,
  buildCalendarMonthGrid,
  calendarAttendanceBlockMessage,
  computeCalendarSummary,
  dateFromDateKey,
  dateKeyFromDate,
  resolveBaseDayType,
  todayDateKey,
  formatDaysOfWeekLabel,
  formatMonthLabel,
  listWorkingDayDateKeys,
  parseCourseMode,
  parseMonthKey,
  summarizeCalendarDateRange,
  type CalendarDateRangeSummary,
  shiftMonthKey,
  unionDaysOfWeek,
} from './batch-calendar.util';

type BatchModePricing = Partial<Record<CourseMode, unknown>>;

@Injectable()
export class BatchCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async listModeSummaries(batchId: string) {
    const batch = await this.getBatchOrThrow(batchId);
    const modes = this.resolveConfiguredModes(batch);
    const exceptions = await this.loadExceptions(batchId);

    const items = await Promise.all(
      modes.map(async (mode) => {
        const config = await this.resolveModeSchedule(batch, mode);
        const modeExceptions = exceptions.filter((row) => row.mode === mode);
        const summary = computeCalendarSummary({
          config,
          exceptions: modeExceptions.map((row) => this.toExceptionRecord(row)),
        });

        return {
          mode,
          modeLabel: BATCH_MODE_LABELS[mode],
          scheduleLabel: config.scheduleLabel,
          startDate: config.startDate,
          endDate: config.endDate,
          summary,
        };
      }),
    );

    return {
      batchId: batch.id,
      batchName: batch.name,
      batchCode: batch.code,
      items,
    };
  }

  async getCalendarView(
    batchId: string,
    modeParam: string,
    monthKey?: string,
  ) {
    const mode = this.parseModeOrThrow(modeParam);
    const batch = await this.getBatchOrThrow(batchId);
    await this.assertModeConfigured(batch, mode);

    const config = await this.resolveModeSchedule(batch, mode);
    const exceptions = await this.loadExceptions(batchId, mode);
    const exceptionRecords = exceptions.map((row) => this.toExceptionRecord(row));
    const resolvedMonthKey =
      monthKey?.trim() ||
      dateKeyFromDate(config.startDate).slice(0, 7);

    parseMonthKey(resolvedMonthKey);

    const summary = computeCalendarSummary({
      config,
      exceptions: exceptionRecords,
    });
    const days = buildCalendarMonthGrid({
      monthKey: resolvedMonthKey,
      config,
      exceptions: exceptionRecords,
    });

    return {
      batch: {
        id: batch.id,
        name: batch.name,
        code: batch.code,
        startDate: batch.startDate,
        endDate: batch.endDate,
      },
      mode,
      modeLabel: BATCH_MODE_LABELS[mode],
      scheduleLabel: config.scheduleLabel,
      monthKey: resolvedMonthKey,
      monthLabel: formatMonthLabel(resolvedMonthKey),
      previousMonthKey: shiftMonthKey(resolvedMonthKey, -1),
      nextMonthKey: shiftMonthKey(resolvedMonthKey, 1),
      summary,
      days,
    };
  }

  async getCalendarDayStatus(
    batchId: string,
    modeParam: string,
    dateKey: string,
  ) {
    const mode = this.parseModeOrThrow(modeParam);
    const batch = await this.getBatchOrThrow(batchId);
    await this.assertModeConfigured(batch, mode);

    const config = await this.resolveModeSchedule(batch, mode);
    const exceptions = await this.loadExceptions(batchId, mode);
    const exceptionMap = new Map(
      exceptions.map((row) => [
        dateKeyFromDate(row.date),
        this.toExceptionRecord(row),
      ]),
    );
    const normalizedDateKey = dateKey.slice(0, 10);
    const dayType = resolveBaseDayType({
      dateKey: normalizedDateKey,
      config,
      exception: exceptionMap.get(normalizedDateKey),
      todayKey: todayDateKey(),
    });

    return {
      dayType,
      isAttendanceAllowed: dayType === 'WORKING',
      blockMessage: calendarAttendanceBlockMessage(dayType),
      reason: exceptionMap.get(normalizedDateKey)?.reason ?? null,
    };
  }

  async listWorkingDays(
    batchId: string,
    modeParam: string,
    from?: string,
    to?: string,
    includeFuture = false,
  ) {
    const mode = this.parseModeOrThrow(modeParam);
    const batch = await this.getBatchOrThrow(batchId);
    await this.assertModeConfigured(batch, mode);

    const config = await this.resolveModeSchedule(batch, mode);
    const exceptions = await this.loadExceptions(batchId, mode);
    const dateKeys = listWorkingDayDateKeys({
      config,
      exceptions: exceptions.map((row) => this.toExceptionRecord(row)),
      from: from?.slice(0, 10),
      to: to?.slice(0, 10),
      includeFuture,
    });

    return { dateKeys };
  }

  async summarizeDateRange(
    batchId: string,
    modeParam: string,
    from: string,
    to: string,
    options?: {
      includeFuture?: boolean;
      enrollmentStartKey?: string;
    },
  ): Promise<CalendarDateRangeSummary> {
    const mode = this.parseModeOrThrow(modeParam);
    const batch = await this.getBatchOrThrow(batchId);
    await this.assertModeConfigured(batch, mode);

    const config = await this.resolveModeSchedule(batch, mode);
    const exceptions = await this.loadExceptions(batchId, mode);

    return summarizeCalendarDateRange({
      config,
      exceptions: exceptions.map((row) => this.toExceptionRecord(row)),
      from: from.slice(0, 10),
      to: to.slice(0, 10),
      enrollmentStartKey: options?.enrollmentStartKey,
      includeFuture: options?.includeFuture ?? false,
    });
  }

  /** Full batch-period calendar totals (start → end), same as Calendar Management. */
  async getModeCalendarSummary(batchId: string, modeParam: string) {
    const mode = this.parseModeOrThrow(modeParam);
    const batch = await this.getBatchOrThrow(batchId);
    await this.assertModeConfigured(batch, mode);

    const config = await this.resolveModeSchedule(batch, mode);
    const exceptions = await this.loadExceptions(batchId, mode);

    return computeCalendarSummary({
      config,
      exceptions: exceptions.map((row) => this.toExceptionRecord(row)),
    });
  }

  async upsertException(params: {
    batchId: string;
    modeParam: string;
    date: string;
    status: BatchCalendarExceptionStatus;
    reason?: string | null;
    actorId?: string;
  }) {
    const mode = this.parseModeOrThrow(params.modeParam);
    const batch = await this.getBatchOrThrow(params.batchId);
    await this.assertModeConfigured(batch, mode);

    const dateKey = params.date.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    const config = await this.resolveModeSchedule(batch, mode);
    const startKey = dateKeyFromDate(config.startDate);
    const endKey = config.endDate ? dateKeyFromDate(config.endDate) : null;
    if (dateKey < startKey || (endKey && dateKey > endKey)) {
      throw new BadRequestException('Date is outside the batch period');
    }

    if (params.status === BatchCalendarExceptionStatus.HOLIDAY) {
      const reason = params.reason?.trim();
      if (!reason) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Holiday reason is required',
          400,
        );
      }
    }

    const date = dateFromDateKey(dateKey);
    const data = {
      status: params.status,
      reason:
        params.status === BatchCalendarExceptionStatus.HOLIDAY
          ? params.reason?.trim() ?? null
          : null,
      updatedBy: params.actorId ?? null,
    };

    const row = await this.prisma.batchModeCalendarException.upsert({
      where: {
        batchId_mode_date: {
          batchId: params.batchId,
          mode,
          date,
        },
      },
      create: {
        batchId: params.batchId,
        mode,
        date,
        ...data,
        createdBy: params.actorId ?? null,
      },
      update: data,
    });

    const exceptions = await this.loadExceptions(params.batchId, mode);
    const exceptionRecords = exceptions.map((item) => this.toExceptionRecord(item));
    const summary = computeCalendarSummary({
      config,
      exceptions: exceptionRecords,
    });
    const dayType = buildCalendarMonthGrid({
      monthKey: dateKey.slice(0, 7),
      config,
      exceptions: exceptionRecords,
    }).find((cell) => cell.dateKey === dateKey);

    return {
      exception: {
        dateKey,
        status: row.status,
        reason: row.reason,
      },
      day: dayType,
      summary,
    };
  }

  async deleteException(params: {
    batchId: string;
    modeParam: string;
    date: string;
  }) {
    const mode = this.parseModeOrThrow(params.modeParam);
    const batch = await this.getBatchOrThrow(params.batchId);
    await this.assertModeConfigured(batch, mode);

    const dateKey = params.date.slice(0, 10);
    const date = dateFromDateKey(dateKey);

    await this.prisma.batchModeCalendarException.deleteMany({
      where: {
        batchId: params.batchId,
        mode,
        date,
      },
    });

    const config = await this.resolveModeSchedule(batch, mode);
    const exceptions = await this.loadExceptions(params.batchId, mode);
    const exceptionRecords = exceptions.map((item) => this.toExceptionRecord(item));
    const summary = computeCalendarSummary({
      config,
      exceptions: exceptionRecords,
    });
    const day = buildCalendarMonthGrid({
      monthKey: dateKey.slice(0, 7),
      config,
      exceptions: exceptionRecords,
    }).find((cell) => cell.dateKey === dateKey);

    return {
      dateKey,
      day,
      summary,
    };
  }

  async isWorkingDay(
    batchId: string,
    mode: CourseMode,
    dateKey: string,
  ): Promise<boolean> {
    const batch = await this.getBatchOrThrow(batchId);
    const config = await this.resolveModeSchedule(batch, mode);
    const exceptions = await this.loadExceptions(batchId, mode);
    const exception = exceptions.find(
      (row) => dateKeyFromDate(row.date) === dateKey.slice(0, 10),
    );

    return listWorkingDayDateKeys({
      config,
      exceptions: exceptions.map((row) => this.toExceptionRecord(row)),
      from: dateKey.slice(0, 10),
      to: dateKey.slice(0, 10),
    }).includes(dateKey.slice(0, 10));
  }

  async filterWorkingAttendanceDates(params: {
    batchId: string;
    mode: CourseMode;
    dateKeys: string[];
  }): Promise<Set<string>> {
    if (!params.dateKeys.length) {
      return new Set();
    }

    const batch = await this.getBatchOrThrow(params.batchId);
    const config = await this.resolveModeSchedule(batch, params.mode);
    const exceptions = await this.loadExceptions(params.batchId, params.mode);
    const working = new Set(
      listWorkingDayDateKeys({
        config,
        exceptions: exceptions.map((row) => this.toExceptionRecord(row)),
      }),
    );

    return new Set(
      params.dateKeys
        .map((value) => value.slice(0, 10))
        .filter((value) => working.has(value)),
    );
  }

  private parseModeOrThrow(value: string): CourseMode {
    const mode = parseCourseMode(value);
    if (!mode) {
      throw new BadRequestException('Invalid learning mode');
    }
    return mode;
  }

  private async getBatchOrThrow(batchId: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, isDeleted: false },
      include: {
        timings: {
          where: { isDeleted: false },
          include: {
            template: {
              select: { hasFixedTime: true },
            },
          },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return batch;
  }

  private resolveConfiguredModes(batch: {
    mode: CourseMode;
    modePricing: Prisma.JsonValue;
    timings: Array<{ mode: CourseMode }>;
  }): CourseMode[] {
    const modes = new Set<CourseMode>();

    for (const timing of batch.timings) {
      modes.add(timing.mode);
    }

    const pricing = (batch.modePricing ?? {}) as BatchModePricing;
    for (const key of Object.keys(pricing)) {
      const mode = parseCourseMode(key);
      if (mode) {
        modes.add(mode);
      }
    }

    if (modes.size === 0) {
      modes.add(batch.mode);
    }

    return BATCH_MODE_ORDER.filter((mode) => modes.has(mode));
  }

  private async assertModeConfigured(
    batch: {
      mode: CourseMode;
      modePricing: Prisma.JsonValue;
      timings: Array<{ mode: CourseMode }>;
    },
    mode: CourseMode,
  ) {
    const modes = this.resolveConfiguredModes(batch);
    if (!modes.includes(mode)) {
      throw new NotFoundException('Learning mode is not configured for this batch');
    }
  }

  async resolveModeSchedule(
    batch: {
      startDate: Date;
      endDate: Date | null;
      daysOfWeek: DayOfWeek[];
      timings: Array<{
        mode: CourseMode;
        daysOfWeek: DayOfWeek[];
        template: { hasFixedTime: boolean } | null;
      }>;
    },
    mode: CourseMode,
  ): Promise<BatchModeScheduleConfig> {
    const modeTimings = batch.timings.filter((timing) => timing.mode === mode);
    const isAnytime =
      modeTimings.length > 0 &&
      modeTimings.every((timing) => timing.template?.hasFixedTime === false);

    let daysOfWeek: DayOfWeek[] = [];
    if (!isAnytime) {
      const union = unionDaysOfWeek(modeTimings.map((timing) => timing.daysOfWeek));
      daysOfWeek = union.length ? union : batch.daysOfWeek;
    }

    return {
      daysOfWeek,
      isAnytime,
      scheduleLabel: isAnytime ? 'Anytime' : formatDaysOfWeekLabel(daysOfWeek),
      startDate: batch.startDate,
      endDate: batch.endDate,
    };
  }

  private async loadExceptions(batchId: string, mode?: CourseMode) {
    return this.prisma.batchModeCalendarException.findMany({
      where: {
        batchId,
        ...(mode ? { mode } : {}),
      },
      orderBy: { date: 'asc' },
    });
  }

  private toExceptionRecord(row: {
    date: Date;
    status: BatchCalendarExceptionStatus;
    reason: string | null;
  }): BatchCalendarExceptionRecord {
    return {
      dateKey: dateKeyFromDate(row.date),
      status: row.status,
      reason: row.reason,
    };
  }
}

export type BatchCalendarViewResponse = Awaited<
  ReturnType<BatchCalendarService['getCalendarView']>
>;

export type BatchCalendarModeSummaryResponse = Awaited<
  ReturnType<BatchCalendarService['listModeSummaries']>
>;

export type BatchCalendarDayCellDto = BatchCalendarDayCell;

export type BatchCalendarSummaryDto = BatchCalendarSummary;
