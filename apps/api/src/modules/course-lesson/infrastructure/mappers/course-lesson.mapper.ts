import {
  CourseLesson as PrismaCourseLesson,
  Prisma,
} from '@prisma/client';

import { CourseLesson } from '../../domain/entities/course-lesson.entity';

export class CourseLessonMapper {
  static toDomain(record: PrismaCourseLesson): CourseLesson {
    return CourseLesson.reconstitute({
      id: record.id,
      moduleId: record.moduleId,
      title: record.title,
      slug: record.slug,
      description: record.description,
      videoUrl: record.videoUrl,
      contentType: record.contentType as CourseLesson['contentType'],
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
    lesson: CourseLesson,
  ): Prisma.CourseLessonUncheckedCreateInput {
    return {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      slug: lesson.slug.getValue(),
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      contentType: lesson.contentType,
      duration: lesson.duration,
      displayOrder: lesson.displayOrder,
      createdBy: lesson.createdBy,
      updatedBy: lesson.updatedBy,
      isDeleted: lesson.isDeleted,
      deletedAt: lesson.deletedAt,
      deletedBy: lesson.deletedBy,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}
