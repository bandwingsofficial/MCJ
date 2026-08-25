import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { TrainerRepository } from '@modules/trainer/domain/repositories/trainer.repository';
import { TrainerStatus } from '@modules/trainer/domain/enums/trainer-status.enum';

import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import type { PrismaBatchCourseRepository } from '../../infrastructure/repositories/prisma-batch-course.repository';
import type { BatchCourseAssignmentRecord } from './batch-course.types';

export class AssignBatchCourseHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly batchCourseRepo: PrismaBatchCourseRepository,
    private readonly courseRepo: CourseRepository,
    private readonly trainerRepo: TrainerRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(params: {
    batchId: string;
    courseId: string;
    trainerId: string;
  }): Promise<BatchCourseAssignmentRecord> {
    await this.domainService.ensureExists(
      await this.batchRepo.findById(params.batchId),
    );

    await this.domainService.ensureCourseExists(
      this.courseRepo,
      params.courseId,
    );

    await this.domainService.ensureActiveTrainers(
      this.trainerRepo,
      [params.trainerId],
    );

    const trainer = await this.trainerRepo.findById(params.trainerId);

    if (!trainer || trainer.status !== TrainerStatus.ACTIVE || trainer.isDeleted) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only active trainers can be assigned to a batch course',
        400,
      );
    }

    try {
      return await this.batchCourseRepo.assign(params);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already assigned')) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          error.message,
          400,
        );
      }

      throw error;
    }
  }
}
