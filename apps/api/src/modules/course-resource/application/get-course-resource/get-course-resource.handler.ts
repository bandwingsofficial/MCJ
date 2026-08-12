import type { CourseResourceRepository } from '../../domain/repositories/course-resource.repository';
import { CourseResourceDomainService } from '../../domain/services/course-resource-domain.service';
import { CourseResourceResponseMapper } from '../../infrastructure/mappers/course-resource-response.mapper';
import { CourseResourceResult } from '../course-resource.result';

import { GetCourseResourceQuery } from './get-course-resource.query';

export class GetCourseResourceHandler {
  constructor(
    private readonly courseResourceRepo: CourseResourceRepository,
    private readonly domainService: CourseResourceDomainService,
  ) {}

  async execute(
    query: GetCourseResourceQuery,
  ): Promise<CourseResourceResult> {
    const resource = await this.domainService.ensureExists(
      await this.courseResourceRepo.findById(
        query.id,
        query.includeDeleted,
      ),
    );

    return CourseResourceResponseMapper.toResult(
      resource,
      query.publicView,
    );
  }
}
