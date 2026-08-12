import { randomUUID } from 'crypto';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';

import { TrainerCourse } from '../../domain/entities/trainer-course.entity';
import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { AssignTrainerCoursesCommand } from './assign-trainer-courses.command';

export class AssignTrainerCoursesHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly courseRepo: CourseRepository,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: AssignTrainerCoursesCommand,
  ): Promise<GetTrainerResult> {
    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.id),
    );
    const courseIds = this.domainService.uniqueCourseIds(
      command.courseIds,
    );

    await this.domainService.ensureCoursesExist(
      this.courseRepo,
      courseIds,
    );

    trainer.update({
      courses: courseIds.map((courseId) =>
        TrainerCourse.create({
          id: randomUUID(),
          trainerId: trainer.id,
          courseId,
        }),
      ),
      updatedBy: command.updatedBy,
    });

    await this.trainerRepo.save(trainer);

    return GetTrainerResult.fromEntity(trainer);
  }
}
