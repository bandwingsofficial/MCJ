export interface ApiSuccessResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

export interface CourseModule {
  id: string;

  courseId: string;

  title: string;

  slug: string;

  description: string | null;

  keySkills: string[];

  thumbnailUrl: string | null;

  duration: number | null;

  displayOrder: number;

  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export type CourseModuleListItem =
  CourseModule;

export type CourseModuleDetails =
  CourseModule;

export interface CreateCourseModuleRequest {
  courseId: string;

  title: string;

  description: string;

  keySkills: string[];
}

export interface UpdateCourseModuleRequest {
  title: string;

  description: string;

  keySkills: string[];
}

export interface MoveCourseModuleRequest {
  newPosition: number;
}

export interface CourseModuleFilters {
  courseId: string;

  includeDeleted: boolean;
}

export interface DeleteCourseModuleResponse {
  id: string;

  isDeleted: boolean;

  deletedAt: string;
}

export type RestoreCourseModuleResponse =
  CourseModule;

export type CreateCourseModuleResponse =
  CourseModule;

export type UpdateCourseModuleResponse =
  CourseModule;

export type MoveCourseModuleResponse =
  CourseModule;