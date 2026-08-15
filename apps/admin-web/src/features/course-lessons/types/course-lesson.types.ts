// src/features/course-lessons/types/course-lesson.types.ts

export type LessonContentType =
  | "LESSON"
  | "SELF_PACED_VIDEO"
  | "LIVE_RECORDED_VIDEO";

export interface CourseLesson {
  id: string;

  moduleId: string;

  title: string;

  slug: string;

  description: string | null;

  videoUrl: string | null;

  contentType?: LessonContentType;

  duration: number | null;

  displayOrder: number;

  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateCourseLessonRequest {
  moduleId: string;

  title: string;

  description?: string;

  videoUrl?: string;

  duration?: number;

  contentType?: LessonContentType;
}

export interface UpdateCourseLessonRequest {
  title?: string;

  description?: string;

  videoUrl?: string;

  duration?: number | null;

  contentType?: LessonContentType;
}

export interface MoveCourseLessonRequest {
  newPosition: number;
}

export interface DeleteCourseLessonResponse {
  success: boolean;

  message: string;

  data: {
    id: string;

    isDeleted: boolean;

    deletedAt: string;
  };
}

export interface CourseLessonResponse {
  success: boolean;

  message: string;

  data: CourseLesson;
}

export interface CourseLessonListResponse {
  success: boolean;

  message: string;

  data: CourseLesson[];
}

export interface CourseLessonFormValues {
  moduleId: string;

  title: string;

  description: string;

  videoUrl: string;
}

export interface CourseLessonFilters {
  search: string;

  courseId: string;

  moduleId?: string;

  includeDeleted: boolean;
}

export interface CourseLessonApiError {
  success: false;

  code: string;

  message: string;
}

export interface GetCourseLessonsRequest {
  moduleId: string;

  includeDeleted: boolean;
}