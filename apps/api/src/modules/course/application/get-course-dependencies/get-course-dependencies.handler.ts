import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';

import type { CourseDeleteBlockingBatch } from '../../domain/types/course-delete-blocking-batch';

export class GetCourseDependenciesResult {
  constructor(
    public readonly courseId: string,
    public readonly courseTitle: string,
    public readonly canDelete: boolean,
    public readonly canDeactivate: boolean,
    public readonly blockingBatches: CourseDeleteBlockingBatch[],
  ) {}
}

export class GetCourseDependenciesHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
  ) {}

  async execute(courseId: string): Promise<GetCourseDependenciesResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(courseId, true),
    );

    const blockingBatches =
      await this.courseRepo.findDeleteBlockingBatches(course.id);

    const canMutate = blockingBatches.length === 0;

    return new GetCourseDependenciesResult(
      course.id,
      course.title.getValue(),
      canMutate,
      canMutate,
      blockingBatches,
    );
  }
}
