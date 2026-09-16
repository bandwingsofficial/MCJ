import type { CourseLearnItem as PrismaCourseLearnItem } from '@prisma/client';

import { CourseLearnItem } from '../../domain/entities/course-learn-item.entity';

export class CourseLearnItemMapper {
  static toDomain(record: PrismaCourseLearnItem): CourseLearnItem {
    return CourseLearnItem.reconstitute({
      id: record.id,
      lessonId: record.lessonId,
      title: record.title,
      explanation: record.explanation,
      imageUrl: record.imageUrl,
      keyLearningPoints: record.keyLearningPoints,
      finalThoughts: record.finalThoughts,
      summary: record.summary,
      displayOrder: record.displayOrder,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(item: CourseLearnItem) {
    return {
      id: item.id,
      lessonId: item.lessonId,
      title: item.title,
      explanation: item.explanation,
      imageUrl: item.imageUrl,
      keyLearningPoints: item.keyLearningPoints,
      finalThoughts: item.finalThoughts,
      summary: item.summary,
      displayOrder: item.displayOrder,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
