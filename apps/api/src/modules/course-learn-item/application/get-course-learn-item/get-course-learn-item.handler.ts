import type { CourseLearnItemRepository } from '../../domain/repositories/course-learn-item.repository';
import { CourseLearnItemDomainService } from '../../domain/services/course-learn-item-domain.service';
import { CourseLearnItemResponseMapper } from '../../infrastructure/mappers/course-learn-item-response.mapper';
import { CourseLearnItemResult } from '../course-learn-item.result';

import { GetCourseLearnItemQuery } from './get-course-learn-item.query';

export class GetCourseLearnItemHandler {
  constructor(
    private readonly courseLearnItemRepo: CourseLearnItemRepository,
    private readonly domainService: CourseLearnItemDomainService,
  ) {}

  async execute(
    query: GetCourseLearnItemQuery,
  ): Promise<CourseLearnItemResult> {
    const item = await this.domainService.ensureExists(
      await this.courseLearnItemRepo.findById(query.id),
    );

    return CourseLearnItemResponseMapper.toResult(item);
  }
}
