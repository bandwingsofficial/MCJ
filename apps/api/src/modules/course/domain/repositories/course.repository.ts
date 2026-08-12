import { Course } from '../entities/course.entity';
import { CourseStatus } from '../enums/course-status.enum';

export interface CourseListFilters {
  categoryId?: string;
  branchId?: string;
  status?: CourseStatus;
  search?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  skip?: number;
  take?: number;
}

export interface CourseRepository {
  save(course: Course): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Course | null>;
  findBySlug(
  slug: string,
  includeDeleted?: boolean,
): Promise<Course | null>;

  findAll(filters?: CourseListFilters): Promise<Course[]>;
  deletePermanent(id: string): Promise<void>;
}
