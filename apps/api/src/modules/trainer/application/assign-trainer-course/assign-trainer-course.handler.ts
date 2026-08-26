import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';

import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { AssignTrainerCourseCommand } from './assign-trainer-course.command';

export class AssignTrainerCourseHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly courseRepo: CourseRepository,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: AssignTrainerCourseCommand,
  ): Promise<GetTrainerResult> {
    await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.trainerId),
    );

    await this.domainService.ensureCoursesExist(this.courseRepo, [
      command.courseId,
    ]);

    await this.trainerRepo.assignCourse(
      command.trainerId,
      command.courseId,
    );

    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.trainerId),
    );

    return GetTrainerResult.fromEntity(trainer);
  }
}
