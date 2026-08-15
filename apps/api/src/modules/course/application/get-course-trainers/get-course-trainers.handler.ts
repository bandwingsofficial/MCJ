import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';

import { GetCourseTrainersQuery } from './get-course-trainers.query';
import { GetCourseTrainersResult } from './get-course-trainers.result';

export class GetCourseTrainersHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
  ) {}

  async execute(
    query: GetCourseTrainersQuery,
  ): Promise<GetCourseTrainersResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(query.courseId),
    );

    const records = await this.courseRepo.findAssignedTrainers(
      course.id,
    );

    return GetCourseTrainersResult.fromRecords(records);
  }
}
