import { CourseLesson } from '../../domain/entities/course-lesson.entity';
import { CourseLessonResult } from '../../application/course-lesson.result';

export class CourseLessonResponseMapper {
  static toResult(
    lesson: CourseLesson,
    publicView = false,
  ): CourseLessonResult {
    return new CourseLessonResult(
      lesson.id,
      lesson.moduleId,
      lesson.parentLessonId,
      lesson.title,
      lesson.slug.getValue(),
      lesson.description,
      publicView ? null : lesson.videoUrl,
      lesson.contentType,
      lesson.duration,
      lesson.displayOrder,
      lesson.createdBy,
      lesson.updatedBy,
      lesson.isDeleted,
      lesson.deletedAt,
      lesson.isPreview,
      lesson.createdAt,
      lesson.updatedAt,
    );
  }

  static toResultList(
    lessons: CourseLesson[],
    publicView = false,
  ): CourseLessonResult[] {
    return lessons.map((lesson) =>
      this.toResult(lesson, publicView),
    );
  }
}
