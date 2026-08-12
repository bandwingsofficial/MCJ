import {
  CourseResource as PrismaCourseResource,
  Prisma,
} from '@prisma/client';

import { CourseResource } from '../../domain/entities/course-resource.entity';
import { ResourceType } from '../../domain/enums/resource-type.enum';

export class CourseResourceMapper {
  static toDomain(record: PrismaCourseResource): CourseResource {
    return CourseResource.reconstitute({
      id: record.id,
      lessonId: record.lessonId,
      title: record.title,
      type: record.type as ResourceType,
      fileUrl: record.fileUrl,
      displayOrder: record.displayOrder,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    resource: CourseResource,
  ): Prisma.CourseResourceUncheckedCreateInput {
    return {
      id: resource.id,
      lessonId: resource.lessonId,
      title: resource.title,
      type: resource.type,
      fileUrl: resource.fileUrl,
      displayOrder: resource.displayOrder,
      createdBy: resource.createdBy,
      updatedBy: resource.updatedBy,
      isDeleted: resource.isDeleted,
      deletedAt: resource.deletedAt,
      deletedBy: resource.deletedBy,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }
}
