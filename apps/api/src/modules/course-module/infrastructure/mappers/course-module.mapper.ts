import {
  CourseModule as PrismaCourseModule,
  Prisma,
} from '@prisma/client';

import { CourseModule } from '../../domain/entities/course-module.entity';

export class CourseModuleMapper {
  static toDomain(record: PrismaCourseModule): CourseModule {
    return CourseModule.reconstitute({
      id: record.id,
      courseId: record.courseId,
      title: record.title,
      slug: record.slug,
      description: record.description,
      keySkills: record.keySkills,
      thumbnailUrl: record.thumbnailUrl,
      duration: record.duration,
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
    module: CourseModule,
  ): Prisma.CourseModuleUncheckedCreateInput {
    return {
      id: module.id,
      courseId: module.courseId,
      title: module.title,
      slug: module.slug.getValue(),
      description: module.description,
      keySkills: module.keySkills,
      thumbnailUrl: module.thumbnailUrl,
      duration: module.duration,
      displayOrder: module.displayOrder,
      createdBy: module.createdBy,
      updatedBy: module.updatedBy,
      isDeleted: module.isDeleted,
      deletedAt: module.deletedAt,
      deletedBy: module.deletedBy,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    };
  }
}
