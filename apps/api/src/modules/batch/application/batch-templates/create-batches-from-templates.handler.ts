import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { DurationType } from '@modules/course/domain/enums/duration-type.enum';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { resolveTemplateScheduleForBatch } from '../../domain/utils/batch-template-schedule.util';
import { CreateBatchCommand } from '../create-batch/create-batch.command';
import { CreateBatchHandler } from '../create-batch/create-batch.handler';
import type { GetBatchResult } from '../get-batch/get-batch.result';

import { CreateBatchesFromTemplatesCommand } from './create-batches-from-templates.command';

export type CreateFromTemplateItemResult = {
  templateId: string;
  templateName: string;
  success: boolean;
  batch?: GetBatchResult;
  error?: string;
};

export type CreateBatchesFromTemplatesResult = {
  createdCount: number;
  failedCount: number;
  results: CreateFromTemplateItemResult[];
};

function getErrorMessage(error: unknown): string {
  if (error instanceof BaseException) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Failed to create batch from timing';
}

export class CreateBatchesFromTemplatesHandler {
  private readonly logger = new Logger(
    CreateBatchesFromTemplatesHandler.name,
  );

  constructor(
    private readonly templateRepo: BatchTemplateRepository,
    private readonly courseRepo: CourseRepository,
    private readonly createBatchHandler: CreateBatchHandler,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: CreateBatchesFromTemplatesCommand,
  ): Promise<CreateBatchesFromTemplatesResult> {
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
    const byId = new Map(templates.map((t) => [t.id, t]));

    const results: CreateFromTemplateItemResult[] = [];

    for (const templateId of templateIds) {
      const template = byId.get(templateId);

      if (!template) {
        results.push({
          templateId,
          templateName: templateId,
          success: false,
          error: 'Batch timing not found',
        });
        continue;
      }

      if (template.isDeleted) {
        results.push({
          templateId,
          templateName: template.name,
          success: false,
          error: 'Batch timing is archived',
        });
        continue;
      }

      if (!template.isActive) {
        results.push({
          templateId,
          templateName: template.name,
          success: false,
          error: 'Batch timing is inactive',
        });
        continue;
      }

      try {
        const schedule = resolveTemplateScheduleForBatch(template);
        const courseTitle = course.title.getValue();
        const baseName = command.name?.trim();
        const name = baseName
          ? templateIds.length > 1
            ? `${baseName} - ${template.name}`
            : baseName
          : `${courseTitle} - ${template.name}`;

        const durationValue =
          command.durationValue ??
          course.duration.getValue() ??
          1;
        const durationType =
          command.durationType ??
          course.durationType ??
          DurationType.MONTHS;

        const originalPrice = command.originalPrice ?? 0;
        const discountedPrice =
          command.discountedPrice ?? originalPrice;
        const discountAmount =
          command.discountAmount ??
          Math.max(0, originalPrice - discountedPrice);
        const isFree = command.isFree ?? originalPrice === 0;

        const batch = await this.createBatchHandler.execute(
          new CreateBatchCommand(
            name,
            course.categoryId,
            command.courseId,
            command.startDate,
            schedule.daysOfWeek,
            command.capacity ?? 1,
            undefined,
            undefined,
            undefined,
            undefined,
            command.endDate,
            schedule.startTime,
            schedule.endTime,
            0,
            template.mode,
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

        await this.prisma.batch.update({
          where: { id: batch.id },
          data: { batchTemplateId: template.id },
        });

        results.push({
          templateId: template.id,
          templateName: template.name,
          success: true,
          batch,
        });
      } catch (error) {
        this.logger.warn(
          `Failed creating batch from template ${template.id}: ${getErrorMessage(error)}`,
        );
        results.push({
          templateId: template.id,
          templateName: template.name,
          success: false,
          error: getErrorMessage(error),
        });
      }
    }

    const createdCount = results.filter((r) => r.success).length;
    const failedCount = results.length - createdCount;

    return {
      createdCount,
      failedCount,
      results,
    };
  }
}
