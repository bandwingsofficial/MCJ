import { CourseResource } from '../entities/course-resource.entity';
import { ResourceType } from '../enums/resource-type.enum';

export interface CourseResourceListFilters {
  lessonId?: string;
  type?: ResourceType;
  search?: string;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface CourseResourceRepository {
  save(resource: CourseResource): Promise<void>;

  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<CourseResource | null>;

  findByLessonId(
    lessonId: string,
    includeDeleted?: boolean,
  ): Promise<CourseResource[]>;

  findAll(
    filters?: CourseResourceListFilters,
  ): Promise<CourseResource[]>;

  deletePermanent(id: string): Promise<void>;

  // Display order management (scoped per lesson)
  getMaxDisplayOrder(lessonId: string): Promise<number>;

  shiftDisplayOrders(
    lessonId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void>;

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
