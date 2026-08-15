import { Injectable } from '@nestjs/common';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { TrainerRepository } from '@modules/trainer/domain/repositories/trainer.repository';
import { TrainerStatus } from '@modules/trainer/domain/enums/trainer-status.enum';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Batch } from '../entities/batch.entity';
import type { BatchRepository } from '../repositories/batch.repository';
import { formatBatchCode } from '../utils/batch-code.util';
import { CourseNotFoundException } from '../errors/course-not-found.exception';
import { TrainerNotFoundException } from '../errors/trainer-not-found.exception';

@Injectable()
export class BatchDomainService {
  async ensureExists(batch: Batch | null): Promise<Batch> {
    if (!batch) {
      throw new BaseException(
        ERROR_CODES.BATCH_NOT_FOUND,
        'Batch not found',
        404,
      );
    }

    return batch;
  }

  async ensureCodeIsAvailable(
    batchRepo: BatchRepository,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await batchRepo.findByCode(code, true);

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.BATCH_ALREADY_EXISTS,
        'Batch code already exists',
        400,
      );
    }
  }

  async ensureSlugIsAvailable(
    batchRepo: BatchRepository,
    slug: string,
    branchId?: string | null,
    excludeId?: string,
  ): Promise<void> {
    const existing = await batchRepo.findBySlug(
      slug,
      true,
    );
    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.BATCH_ALREADY_EXISTS,
        'Batch slug already exists',
        400,
      );
    }
  }

  async ensureCourseExists(
    courseRepo: CourseRepository,
    courseId: string,
  ): Promise<void> {
    const course = await courseRepo.findById(courseId);

    if (!course) {
      throw new CourseNotFoundException(courseId);
    }
  }

  async ensureTrainersExist(
    trainerRepo: TrainerRepository,
    trainerIds: string[],
  ): Promise<void> {
    for (const trainerId of trainerIds) {
      const trainer = await trainerRepo.findById(trainerId);

      if (!trainer) {
        throw new TrainerNotFoundException(trainerId);
      }
    }
  }

  async ensureActiveTrainers(
    trainerRepo: TrainerRepository,
    trainerIds: string[],
  ): Promise<void> {
    for (const trainerId of trainerIds) {
      const trainer = await trainerRepo.findById(trainerId);

      if (!trainer) {
        throw new TrainerNotFoundException(trainerId);
      }

      if (trainer.isDeleted) {
        throw new BaseException(
          ERROR_CODES.TRAINER_NOT_FOUND,
          `Trainer ${trainerId} is not available`,
          400,
        );
      }

      if (trainer.status !== TrainerStatus.ACTIVE) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Only active trainers can be assigned to a batch',
          400,
        );
      }
    }
  }

  async generateUniqueBatchCode(
    batchRepo: BatchRepository,
  ): Promise<string> {
    const maxNumber = await batchRepo.getMaxBatchCodeNumber();

    for (let offset = 1; offset <= 50; offset++) {
      const candidate = formatBatchCode(maxNumber + offset);
      const existing = await batchRepo.findByCode(candidate, true);

      if (!existing) {
        return candidate;
      }
    }

    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Unable to generate a unique batch code',
      500,
    );
  }

  validateSchedule(params: {
    startDate: Date;
    endDate?: Date | null;
    daysOfWeek: unknown[];
  }): void {
    if (!params.endDate) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Batch end date is required',
        400,
      );
    }

    if (params.endDate < params.startDate) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Batch end date cannot be before start date',
        400,
      );
    }

    if (!params.daysOfWeek.length) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'At least one batch day is required',
        400,
      );
    }
  }

  uniqueIds(ids: string[]): string[] {
    return Array.from(new Set(ids));
  }
}
