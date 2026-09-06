import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DurationType } from '@modules/course/domain/enums/duration-type.enum';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';
import {
  parseTimeToMinutes,
  resolveTemplateScheduleForBatch,
} from '../../domain/utils/batch-template-schedule.util';
import { CreateBatchCommand } from '../create-batch/create-batch.command';
import { CreateBatchHandler } from '../create-batch/create-batch.handler';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { CreateBatchWithTimingsCommand } from './create-batch-with-timings.command';

const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

type ResolvedTiming = {
  templateId: string;
  name: string;
  mode: CourseMode;
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
};

/**
 * Creates ONE parent Batch and attaches every selected timing to it as a child
 * BatchTiming row. Selecting four timings must never produce four batches.
 */
export class CreateBatchWithTimingsHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
    private readonly courseRepo: CourseRepository,
    private readonly batchRepo: BatchRepository,
    private readonly createBatchHandler: CreateBatchHandler,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: CreateBatchWithTimingsCommand,
  ): Promise<GetBatchResult> {
    const templateIds = [
      ...new Set(
        (command.templateIds ?? []).map((id) => id.trim()).filter(Boolean),
      ),
    ];

    if (!templateIds.length) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Select at least one batch timing',
        400,
      );
    }

    if (!command.courseId?.trim()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Course is required',
        400,
      );
    }

    if (
      !command.startDate ||
      Number.isNaN(command.startDate.getTime()) ||
      !command.endDate ||
      Number.isNaN(command.endDate.getTime())
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Start date and end date are required',
        400,
      );
    }

    const course = await this.courseRepo.findById(command.courseId);
    if (!course || course.isDeleted) {
      throw new BaseException(
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course not found',
        404,
      );
    }

    const templates = await this.templateRepo.findByIds(templateIds);
    const byId = new Map(templates.map((template) => [template.id, template]));

    const timings: ResolvedTiming[] = templateIds.map((templateId) => {
      const template = byId.get(templateId);

      if (!template || template.isDeleted) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Selected batch timing is no longer available',
          400,
        );
      }

      if (!template.isActive) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          `Batch timing "${template.name}" is inactive`,
          400,
        );
      }

      const schedule = resolveTemplateScheduleForBatch(template);

      return {
        templateId: template.id,
        name: template.name,
        mode: template.mode,
        daysOfWeek: schedule.daysOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      };
    });

    const name =
      command.name?.trim() || `${course.title.getValue()} Batch`;

    if (
      !command.durationValue ||
      command.durationValue < 1 ||
      !command.durationType
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Duration value and duration type are required',
        400,
      );
    }

    const durationValue = command.durationValue;
    const durationType = command.durationType as DurationType;

    const originalPrice = command.originalPrice ?? 0;
    const discountedPrice = command.discountedPrice ?? originalPrice;
    const discountAmount =
      command.discountAmount ??
      Math.max(0, originalPrice - discountedPrice);
    const isFree = command.isFree ?? originalPrice === 0;

    // The parent batch spans every child timing: earliest start, latest end.
    const span = this.resolveBatchSpan(timings);

    const created = await this.createBatchHandler.execute(
      new CreateBatchCommand(
        name,
        course.categoryId,
        command.courseId,
        command.startDate,
        span.daysOfWeek,
        command.capacity ?? 1,
        undefined,
        undefined,
        undefined,
        undefined,
        command.endDate,
        span.startTime,
        span.endTime,
        0,
        timings[0].mode,
        undefined,
        undefined,
        false,
        undefined,
        true,
        [],
        command.createdBy,
        originalPrice,
        discountAmount,
        discountedPrice,
        command.currency ?? 'INR',
        isFree,
        durationValue,
        durationType,
      ),
    );

    await this.prisma.batchTiming.createMany({
      data: timings.map((timing, index) => ({
        batchId: created.id,
        batchTemplateId: timing.templateId,
        name: timing.name,
        mode: timing.mode,
        daysOfWeek: timing.daysOfWeek,
        startDate: command.startDate,
        endDate: command.endDate,
        startTime: timing.startTime,
        endTime: timing.endTime,
        capacity: command.capacity ?? 0,
        displayOrder: index + 1,
        createdBy: command.createdBy ?? null,
      })),
    });

    const batch = await this.batchRepo.findById(created.id);

    if (!batch) {
      throw new BaseException(
        ERROR_CODES.BATCH_NOT_FOUND,
        'Batch not found after creation',
        404,
      );
    }

    return GetBatchResult.fromEntity(batch);
  }

  private resolveBatchSpan(timings: ResolvedTiming[]): {
    daysOfWeek: DayOfWeek[];
    startTime: string;
    endTime: string;
  } {
    const days = new Set<DayOfWeek>();
    let earliest = timings[0].startTime;
    let latest = timings[0].endTime;

    for (const timing of timings) {
      timing.daysOfWeek.forEach((day) => days.add(day));

      if (parseTimeToMinutes(timing.startTime) < parseTimeToMinutes(earliest)) {
        earliest = timing.startTime;
      }

      if (parseTimeToMinutes(timing.endTime) > parseTimeToMinutes(latest)) {
        latest = timing.endTime;
      }
    }

    return {
      daysOfWeek: DAY_ORDER.filter((day) => days.has(day)),
      startTime: earliest,
      endTime: latest,
    };
  }
}
