import { CourseLearnItem } from '../entities/course-learn-item.entity';

export interface CourseLearnItemListFilters {
  lessonId?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export interface CourseLearnItemRepository {
  save(item: CourseLearnItem): Promise<void>;
  findById(id: string): Promise<CourseLearnItem | null>;
  findByLessonId(lessonId: string): Promise<CourseLearnItem[]>;
  findAll(filters?: CourseLearnItemListFilters): Promise<CourseLearnItem[]>;
  deletePermanent(id: string): Promise<void>;
  getMaxDisplayOrder(lessonId: string): Promise<number>;
  closeDisplayOrderGap(
    lessonId: string,
    deletedDisplayOrder: number,
  ): Promise<void>;
  move(
    id: string,
    lessonId: string,
    oldOrder: number,
    newOrder: number,
    updatedBy?: string | null,
  ): Promise<void>;
}
