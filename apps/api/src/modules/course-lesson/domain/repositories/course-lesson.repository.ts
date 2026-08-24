import { CourseLesson } from '../entities/course-lesson.entity';

export interface CourseLessonListFilters {
  moduleId?: string;
  parentLessonId?: string | null;
  contentType?: string;
  search?: string;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface CourseLessonRepository {
  save(lesson: CourseLesson): Promise<void>;

  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<CourseLesson | null>;

  findBySlug(
    moduleId: string,
    slug: string,
    includeDeleted?: boolean,
  ): Promise<CourseLesson | null>;

  findByModuleId(
    moduleId: string,
    includeDeleted?: boolean,
  ): Promise<CourseLesson[]>;

  findAll(
    filters?: CourseLessonListFilters,
  ): Promise<CourseLesson[]>;

  deletePermanent(id: string): Promise<void>;

  // Display order management (scoped per module + parent lesson)
  getMaxDisplayOrder(
    moduleId: string,
    parentLessonId?: string | null,
  ): Promise<number>;

  shiftDisplayOrders(
    moduleId: string,
    oldOrder: number,
    newOrder: number,
    parentLessonId?: string | null,
  ): Promise<void>;

  closeDisplayOrderGap(
    moduleId: string,
    deletedDisplayOrder: number,
    parentLessonId?: string | null,
  ): Promise<void>;

  move(
    id: string,
    moduleId: string,
    oldOrder: number,
    newOrder: number,
    updatedBy?: string | null,
    parentLessonId?: string | null,
  ): Promise<void>;

  // Cascade operations (down to resources)
  cascadeSoftDelete(
    lessonId: string,
    deletedBy?: string | null,
  ): Promise<void>;

  cascadeRestore(lessonId: string): Promise<void>;
}
