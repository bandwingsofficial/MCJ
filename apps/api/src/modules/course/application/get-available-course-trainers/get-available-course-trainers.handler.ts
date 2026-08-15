import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import { GetCourseTrainersResult } from '../get-course-trainers/get-course-trainers.result';

import { GetAvailableCourseTrainersQuery } from './get-available-course-trainers.query';

export class GetAvailableCourseTrainersHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
  ) {}

  async execute(
    query: GetAvailableCourseTrainersQuery,
  ): Promise<GetCourseTrainersResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(query.courseId),
    );

    const records = await this.courseRepo.findAvailableActiveTrainers(
      course.id,
    );

    return GetCourseTrainersResult.fromRecords(records);
  }
}
