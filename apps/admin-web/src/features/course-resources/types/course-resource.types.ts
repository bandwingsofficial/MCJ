export interface ApiSuccessResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

export interface CourseResource {
  id: string;

  lessonId: string;

  title: string;

  type: string;

  fileUrl: string;

  displayOrder: number;

  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export type CourseResourceListItem =
  CourseResource;

export type CourseResourceDetails =
  CourseResource;

export interface CreateCourseResourceRequest {
  lessonId: string;

  title: string;

  type: string;

  fileUrl: string;
}

export interface UpdateCourseResourceRequest {
  title: string;

  type: string;

  fileUrl: string;
}

export interface MoveCourseResourceRequest {
  newPosition: number;
}

export interface CourseResourceFilters {
  lessonId: string;

  search: string;

  includeDeleted: boolean;
}

export interface DeleteCourseResourceResponse {
  id: string;

  isDeleted: boolean;

  deletedAt: string;
}

export type CreateCourseResourceResponse =
  CourseResource;

export type UpdateCourseResourceResponse =
  CourseResource;

export type RestoreCourseResourceResponse =
  CourseResource;

export type MoveCourseResourceResponse =
  CourseResource;

  export interface CourseResourceFormValues {
  lessonId: string;

  title: string;

  type: string;

  fileUrl: string;
}