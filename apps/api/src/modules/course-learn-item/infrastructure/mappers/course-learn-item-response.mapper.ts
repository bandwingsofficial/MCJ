import { CourseLearnItem } from '../../domain/entities/course-learn-item.entity';
import { CourseLearnItemResult } from '../../application/course-learn-item.result';

export class CourseLearnItemResponseMapper {
  static toResult(item: CourseLearnItem): CourseLearnItemResult {
    return new CourseLearnItemResult(
      item.id,
      item.lessonId,
      item.title,
      item.explanation,
      item.imageUrl,
      item.keyLearningPoints,
      item.finalThoughts,
      item.summary,
      item.displayOrder,
      item.createdAt.toISOString(),
      item.updatedAt.toISOString(),
    );
  }
}
