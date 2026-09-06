import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { validateBatchTemplateSchedule } from '../../domain/utils/batch-template-schedule.util';
import { UpdateBatchTemplateCommand } from './update-batch-template.command';
import { BatchTemplateResult } from './batch-template.result';

export class UpdateBatchTemplateHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
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

    const updated = await this.templateRepo.update(command.id, {
      name,
      mode: nextMode,
      daysOfWeek: schedule.daysOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      hasFixedTime: schedule.hasFixedTime,
      isActive: command.isActive,
      updatedBy: command.updatedBy,
    });

    return BatchTemplateResult.fromRecord(updated);
  }
}
