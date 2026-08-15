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

export interface CourseManagementCounts {
  batches: number;
  students: number;
  instructors: number;
  branches: number;
  modules: number;
  lessons: number;
  quizzes: number;
}

export interface CourseTrainerRecord {
  id: string;
  firstName: string;
  lastName: string | null;
  employeeCode: string | null;
  specialization: string | null;
  phone: string | null;
  status: string;
}

export interface CourseRepository {
  save(course: Course): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Course | null>;
  findByIdIncludingDeleted(
    id: string,
  ): Promise<Course | null>;
  findBySlug(
    slug: string,
    includeDeleted?: boolean,
  ): Promise<Course | null>;

  findAll(filters?: CourseListFilters): Promise<Course[]>;
  count(filters?: CourseListFilters): Promise<number>;
  getMaxDisplayOrder(): Promise<number>;
  getMaxActiveDisplayOrder(): Promise<number>;
  getMaxCourseCodeNumber(): Promise<number>;
  existsByCourseCode(
    courseCode: string,
    excludeId?: string,
  ): Promise<boolean>;
  closeDisplayOrderGap(deletedDisplayOrder: number): Promise<void>;
  moveDisplayOrder(
    courseId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void>;
  getManagementCounts(
    courseId: string,
  ): Promise<CourseManagementCounts>;
  findAssignedTrainers(
    courseId: string,
  ): Promise<CourseTrainerRecord[]>;
  findAvailableActiveTrainers(
    courseId: string,
  ): Promise<CourseTrainerRecord[]>;
  assignTrainersToCourse(
    courseId: string,
    trainerIds: string[],
  ): Promise<number>;
  removeTrainerFromCourse(
    courseId: string,
    trainerId: string,
  ): Promise<void>;
  deletePermanent(id: string): Promise<void>;
}
