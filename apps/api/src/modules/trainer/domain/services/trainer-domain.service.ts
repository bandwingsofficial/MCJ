import { Injectable } from '@nestjs/common';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Trainer } from '../entities/trainer.entity';
import type { TrainerRepository } from '../repositories/trainer.repository';
import { CourseNotFoundException } from '../errors/course-not-found.exception';

@Injectable()
export class TrainerDomainService {
  async ensureExists(
    trainer: Trainer | null,
  ): Promise<Trainer> {
    if (!trainer) {
      throw new BaseException(
        ERROR_CODES.TRAINER_NOT_FOUND,
        'Trainer not found',
        404,
      );
    }

    return trainer;
  }

  async ensureEmailIsAvailable(
    trainerRepo: TrainerRepository,
    email?: string | null,
    excludeId?: string,
  ): Promise<void> {
    if (!email) return;

    const existing = await trainerRepo.findByEmail(email, true);

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.TRAINER_ALREADY_EXISTS,
        'Trainer email already exists',
        400,
      );
    }
  }
  async ensurePhoneIsAvailable(
  trainerRepo: TrainerRepository,
  phone?: string | null,
  excludeId?: string,
): Promise<void> {
  if (!phone) return;

  const existing =
    await trainerRepo.findByPhone(phone, true);

  if (existing && existing.id !== excludeId) {
    throw new BaseException(
      ERROR_CODES.TRAINER_ALREADY_EXISTS,
      'Trainer phone already exists',
      400,
    );
  }
}

  async ensureEmployeeCodeIsAvailable(
    trainerRepo: TrainerRepository,
    employeeCode?: string | null,
    excludeId?: string,
  ): Promise<void> {
    if (!employeeCode) return;

    const existing = await trainerRepo.findByEmployeeCode(
      employeeCode,
      true,
    );

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.TRAINER_ALREADY_EXISTS,
        'Trainer employee code already exists',
        400,
      );
    }
  }

  async ensureCoursesExist(
    courseRepo: CourseRepository,
    courseIds: string[],
  ): Promise<void> {
    for (const courseId of courseIds) {
      const course = await courseRepo.findById(courseId);

      if (!course) {
        throw new CourseNotFoundException(courseId);
      }
    }
  }

  uniqueCourseIds(courseIds: string[]): string[] {
    return Array.from(new Set(courseIds));
  }
}
