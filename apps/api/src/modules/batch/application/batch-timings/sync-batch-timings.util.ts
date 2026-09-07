import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import {
  resolveTemplateScheduleForBatch,
} from '../../domain/utils/batch-template-schedule.util';

type SyncBatchTimingsInput = {
  batchId: string;
  templateIds: string[];
  startDate: Date;
  endDate: Date;
  capacity: number;
  updatedBy?: string;
};

export async function syncBatchTimings(
  prisma: PrismaService,
  templateRepo: BatchTemplateRepository,
  input: SyncBatchTimingsInput,
): Promise<void> {
  const templateIds = [
    ...new Set(
      (input.templateIds ?? []).map((id) => id.trim()).filter(Boolean),
    ),
  ];

  if (!templateIds.length) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Select at least one batch timing',
      400,
    );
  }

  const templates = await templateRepo.findByIds(templateIds);
  const byId = new Map(templates.map((template) => [template.id, template]));

  for (const templateId of templateIds) {
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
  }

  const existingTimings = await prisma.batchTiming.findMany({
    where: { batchId: input.batchId },
  });

  const activeByTemplateId = new Map(
    existingTimings
      .filter((timing) => !timing.isDeleted && timing.batchTemplateId)
      .map((timing) => [timing.batchTemplateId!, timing]),
  );

  const selectedSet = new Set(templateIds);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    for (const timing of existingTimings) {
      if (
        timing.isDeleted ||
        !timing.batchTemplateId ||
        selectedSet.has(timing.batchTemplateId)
      ) {
        continue;
      }

      await tx.batchTiming.update({
        where: { id: timing.id },
        data: {
          isDeleted: true,
          deletedAt: now,
          deletedBy: input.updatedBy ?? null,
          updatedBy: input.updatedBy ?? null,
        },
      });
    }

    let displayOrder =
      existingTimings.reduce(
        (max, timing) => Math.max(max, timing.displayOrder ?? 0),
        0,
      ) + 1;

    for (const templateId of templateIds) {
      const existing = activeByTemplateId.get(templateId);

      if (existing) {
        const template = byId.get(templateId)!;
        const schedule = resolveTemplateScheduleForBatch(template);

        await tx.batchTiming.update({
          where: { id: existing.id },
          data: {
            name: template.name,
            mode: template.mode,
            daysOfWeek: schedule.daysOfWeek,
            startDate: input.startDate,
            endDate: input.endDate,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            capacity: template.capacity,
            updatedBy: input.updatedBy ?? null,
          },
        });
        continue;
      }

      const softDeleted = existingTimings.find(
        (timing) =>
          timing.isDeleted && timing.batchTemplateId === templateId,
      );

      const template = byId.get(templateId)!;
      const schedule = resolveTemplateScheduleForBatch(template);

      if (softDeleted) {
        await tx.batchTiming.update({
          where: { id: softDeleted.id },
          data: {
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            name: template.name,
            mode: template.mode,
            daysOfWeek: schedule.daysOfWeek,
            startDate: input.startDate,
            endDate: input.endDate,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            capacity: template.capacity,
            displayOrder: softDeleted.displayOrder ?? displayOrder,
            updatedBy: input.updatedBy ?? null,
          },
        });
        displayOrder += 1;
        continue;
      }

      await tx.batchTiming.create({
        data: {
          batchId: input.batchId,
          batchTemplateId: templateId,
          name: template.name,
          mode: template.mode,
          daysOfWeek: schedule.daysOfWeek,
          startDate: input.startDate,
          endDate: input.endDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          capacity: template.capacity,
          displayOrder,
          createdBy: input.updatedBy ?? null,
        },
      });
      displayOrder += 1;
    }
  });
}
