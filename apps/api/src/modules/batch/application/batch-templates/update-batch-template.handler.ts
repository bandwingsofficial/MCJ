import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import { resolveBatchApiStatus } from '../../domain/utils/batch-lifecycle-status.util';
import { validateBatchTemplateSchedule } from '../../domain/utils/batch-template-schedule.util';
import { UpdateBatchTemplateCommand } from './update-batch-template.command';
import { BatchTemplateResult } from './batch-template.result';

export class UpdateBatchTemplateHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: UpdateBatchTemplateCommand,
  ): Promise<BatchTemplateResult> {
    const existing = await this.templateRepo.findById(command.id);
    if (!existing || existing.isDeleted) {
      throw new BaseException(
        ERROR_CODES.BATCH_TEMPLATE_NOT_FOUND,
        'Batch timing not found',
        404,
      );
    }

    const nextHasFixedTime =
      command.hasFixedTime ?? existing.hasFixedTime;
    const nextMode = command.mode ?? existing.mode;
    const nextDays =
      command.daysOfWeek ?? existing.daysOfWeek;
    const nextStart =
      command.startTime !== undefined
        ? command.startTime
        : existing.startTime;
    const nextEnd =
      command.endTime !== undefined
        ? command.endTime
        : existing.endTime;

    const schedule = validateBatchTemplateSchedule({
      hasFixedTime: nextHasFixedTime,
      mode: nextMode,
      daysOfWeek: nextDays,
      startTime: nextStart,
      endTime: nextEnd,
    });

    const name =
      command.name !== undefined
        ? command.name.trim()
        : existing.name;

    if (!name) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Template name is required',
        400,
      );
    }

    if (command.capacity !== undefined && command.capacity < 1) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Capacity must be at least 1',
        400,
      );
    }

    const updated = await this.templateRepo.update(command.id, {
      name,
      mode: nextMode,
      daysOfWeek: schedule.daysOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      hasFixedTime: schedule.hasFixedTime,
      capacity: command.capacity,
      isActive: command.isActive,
      updatedBy: command.updatedBy,
    });

    if (command.capacity !== undefined) {
      const linkedTimings = await this.prisma.batchTiming.findMany({
        where: {
          batchTemplateId: command.id,
          isDeleted: false,
          batch: { isDeleted: false },
        },
        select: {
          id: true,
          batch: {
            select: {
              status: true,
              startDate: true,
              endDate: true,
              startTime: true,
              endTime: true,
              isDeleted: true,
            },
          },
        },
      });

      const liveTimingIds = linkedTimings
        .filter((row) => {
          const batch = row.batch;
          const resolved = resolveBatchApiStatus({
            storedStatus: batch.status as BatchStatus,
            isDeleted: batch.isDeleted,
            startDate: batch.startDate,
            startTime: batch.startTime,
            endDate: batch.endDate,
            endTime: batch.endTime,
          });

          return (
            resolved === BatchStatus.UPCOMING ||
            resolved === BatchStatus.ONGOING
          );
        })
        .map((row) => row.id);

      if (liveTimingIds.length > 0) {
        await this.prisma.batchTiming.updateMany({
          where: { id: { in: liveTimingIds } },
          data: {
            capacity: command.capacity,
            updatedBy: command.updatedBy ?? null,
          },
        });
      }
    }

    return BatchTemplateResult.fromRecord(updated);
  }
}
