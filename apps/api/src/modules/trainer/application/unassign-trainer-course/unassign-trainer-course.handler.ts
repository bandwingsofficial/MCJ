import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { UnassignTrainerCourseCommand } from './unassign-trainer-course.command';

export class UnassignTrainerCourseHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: UnassignTrainerCourseCommand,
  ): Promise<GetTrainerResult> {
    await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.trainerId),
    );

    await this.trainerRepo.unassignCourse(
      command.trainerId,
      command.courseId,
    );

    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.trainerId),
    );

    return GetTrainerResult.fromEntity(trainer);
  }
}
