import { CourseResource } from '../../domain/entities/course-resource.entity';
import { CourseResourceResult } from '../../application/course-resource.result';

export class CourseResourceResponseMapper {
  static toResult(
    resource: CourseResource,
    publicView = false,
  ): CourseResourceResult {
    return new CourseResourceResult(
      resource.id,
      resource.lessonId,
      resource.title,
      resource.type,
      publicView ? null : resource.fileUrl,
      resource.displayOrder,
      resource.createdBy,
      resource.updatedBy,
      resource.isDeleted,
      resource.deletedAt,
      resource.createdAt,
      resource.updatedAt,
    );
  }

  static toResultList(
    resources: CourseResource[],
    publicView = false,
  ): CourseResourceResult[] {
    return resources.map((resource) =>
      this.toResult(resource, publicView),
    );
  }
}
