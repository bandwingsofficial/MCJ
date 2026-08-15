import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import { CourseTrainerResult } from '../shared/course-trainer.result';

import { AssignCourseTrainersCommand } from './assign-course-trainers.command';
import { AssignCourseTrainersResult } from './assign-course-trainers.result';

export class AssignCourseTrainersHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
  ) {}

  async execute(
    command: AssignCourseTrainersCommand,
  ): Promise<AssignCourseTrainersResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(command.courseId),
    );

    const trainerIds = this.domainService.uniqueIds(
      command.trainerIds,
    );

    if (trainerIds.length === 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Please select at least one trainer.',
        400,
      );
    }

    const assignedCount = await this.courseRepo.assignTrainersToCourse(
      course.id,
      trainerIds,
    );

    const records = await this.courseRepo.findAssignedTrainers(
      course.id,
    );

    return new AssignCourseTrainersResult(
      assignedCount,
      records.map((record) => CourseTrainerResult.fromRecord(record)),
    );
  }
}
