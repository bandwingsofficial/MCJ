import { CourseModule } from '../entities/course-module.entity';

export interface CourseModuleListFilters {
  courseId?: string;
  search?: string;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface CourseModuleRepository {
  save(module: CourseModule): Promise<void>;

  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<CourseModule | null>;

  findBySlug(
    courseId: string,
    slug: string,
    includeDeleted?: boolean,
  ): Promise<CourseModule | null>;

  findByCourseId(
    courseId: string,
    includeDeleted?: boolean,
  ): Promise<CourseModule[]>;

  findAll(
    filters?: CourseModuleListFilters,
  ): Promise<CourseModule[]>;

  deletePermanent(id: string): Promise<void>;

  // Display order management (scoped per course)
  getMaxDisplayOrder(courseId: string): Promise<number>;

  shiftDisplayOrders(
    courseId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void>;

  closeDisplayOrderGap(
    courseId: string,
    deletedDisplayOrder: number,
  ): Promise<void>;

  move(
    id: string,
    courseId: string,
    oldOrder: number,
    newOrder: number,
    updatedBy?: string | null,
  ): Promise<void>;

  // Cascade operations (down to lessons + resources)
  cascadeSoftDelete(
    moduleId: string,
    deletedBy?: string | null,
  ): Promise<void>;

  cascadeRestore(moduleId: string): Promise<void>;
}
