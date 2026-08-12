import { Injectable } from '@nestjs/common';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { TrainerRepository } from '@modules/trainer/domain/repositories/trainer.repository';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Batch } from '../entities/batch.entity';
import type { BatchRepository } from '../repositories/batch.repository';
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

  validateSchedule(params: {
    startDate: Date;
    endDate?: Date | null;
    startTime: string;
    endTime: string;
    daysOfWeek: unknown[];
  }): void {
    if (params.endDate && params.endDate < params.startDate) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Batch end date cannot be before start date',
        400,
      );
    }

    if (params.endTime <= params.startTime) {
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
