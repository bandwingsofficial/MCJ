import { Injectable } from '@nestjs/common';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import { CategoryNotFoundException } from '@modules/course/domain/errors/category-not-found.exception';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { TrainerRepository } from '@modules/trainer/domain/repositories/trainer.repository';
import { TrainerStatus } from '@modules/trainer/domain/enums/trainer-status.enum';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Batch } from '../entities/batch.entity';
import type { BatchRepository } from '../repositories/batch.repository';
import {
  buildBatchCodePrefix,
  formatBatchCode,
  getMonthAbbreviation,
  getTimeCodeFromTimes,
  parseTimeToMinutes,
} from '../utils/batch-code.util';
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

  async ensureCategoryExists(
    categoryRepo: CategoryRepository,
    categoryId: string,
  ): Promise<void> {
    const category = await categoryRepo.findById(categoryId);

    if (!category || category.isDeleted) {
      throw new CategoryNotFoundException();
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
    startTime: string,
    endTime: string,
    referenceDate: Date = new Date(),
  ): Promise<string> {
    const month = getMonthAbbreviation(referenceDate);
    const timeCode = getTimeCodeFromTimes(startTime, endTime);
    const prefix = buildBatchCodePrefix(month, timeCode);
    const maxSequence = await batchRepo.getMaxBatchCodeSequence(prefix);

    for (let offset = 1; offset <= 50; offset++) {
      const candidate = formatBatchCode(
        month,
        timeCode,
        maxSequence + offset,
      );
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
    startDate?: Date;
    endDate?: Date | null;
    startTime: string;
    endTime: string;
    daysOfWeek: unknown[];
  }): void {
    if (params.startDate && params.endDate) {
      const start = new Date(params.startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(params.endDate);
      end.setHours(0, 0, 0, 0);

      if (end.getTime() < start.getTime()) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Batch end date cannot be earlier than start date',
          400,
        );
      }
    }

    if (!params.startTime?.trim() || !params.endTime?.trim()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Batch start time and end time are required',
        400,
      );
    }

    const startMinutes = parseTimeToMinutes(params.startTime);
    const endMinutes = parseTimeToMinutes(params.endTime);

    if (endMinutes <= startMinutes) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Batch end time must be after start time',
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
