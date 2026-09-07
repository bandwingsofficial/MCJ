import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { validateBatchTemplateSchedule } from '../../domain/utils/batch-template-schedule.util';
import { CreateBatchTemplateCommand } from './create-batch-template.command';
import { BatchTemplateResult } from './batch-template.result';

export class CreateBatchTemplateHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(
    command: CreateBatchTemplateCommand,
  ): Promise<BatchTemplateResult> {
    const name = command.name?.trim();
    if (!name) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Template name is required',
        400,
      );
    }

    if (!command.capacity || command.capacity < 1) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Capacity must be at least 1',
        400,
      );
    }

    const schedule = validateBatchTemplateSchedule({
      hasFixedTime: command.hasFixedTime,
      mode: command.mode,
      daysOfWeek: command.daysOfWeek ?? [],
      startTime: command.startTime,
      endTime: command.endTime,
    });

    const created = await this.templateRepo.create({
      name,
      mode: command.mode,
      daysOfWeek: schedule.daysOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      hasFixedTime: schedule.hasFixedTime,
      capacity: command.capacity,
      isActive: command.isActive ?? true,
      createdBy: command.createdBy,
    });

    return BatchTemplateResult.fromRecord(created);
  }
}
