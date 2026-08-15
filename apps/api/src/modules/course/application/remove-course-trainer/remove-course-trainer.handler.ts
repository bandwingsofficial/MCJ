import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';

import { RemoveCourseTrainerCommand } from './remove-course-trainer.command';

export class RemoveCourseTrainerHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
  ) {}

  async execute(command: RemoveCourseTrainerCommand): Promise<void> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(command.courseId),
    );

    await this.courseRepo.removeTrainerFromCourse(
      course.id,
      command.trainerId,
    );
  }
}
