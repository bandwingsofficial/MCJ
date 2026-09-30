// src/features/courses/types/course.types.ts

export type CourseLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

export type CourseStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DRAFT"
  | "ARCHIVED";

export interface CourseCategory {
  id: string;
  name: string;
}

export interface CourseBranch {
  id: string;
  branchName: string;
  branchCode: string;
}

export type CoursePreviewLessonVideoContentType =
  | "SELF_PACED_VIDEO"
  | "LIVE_RECORDED_VIDEO"
  | string;

export interface CoursePreviewLessonVideo {
  id: string;
  title: string;
  videoUrl: string | null;
  contentType: CoursePreviewLessonVideoContentType;
  duration: number | null;
  displayOrder: number;
  description?: string | null;
  recordedAt?: string | null;
}

/** @deprecated Use CoursePreviewLessonVideo */
export type CoursePreviewSelfPacedVideo = CoursePreviewLessonVideo;

export interface CoursePreviewLesson {
  id: string;
  title: string;
  displayOrder: number;
  duration: number | null;
  isPreview: boolean;
  description?: string | null;
  resourceCount?: number;
  hasQuiz?: boolean;
  learnItemCount?: number;
  selfPacedVideoCount?: number;
  liveRecordedVideoCount?: number;
}

export interface CoursePreviewLessonDetail extends CoursePreviewLesson {
  previewVideos: CoursePreviewLessonVideo[];
  previewVideo: CoursePreviewLessonVideo | null;
}

export interface GetCoursePreviewLessonResponse {
  success: boolean;
  message: string;
  data: CoursePreviewLessonDetailDto;
}

export interface CoursePreviewLessonDetailDto {
  id: string;
  title: string;
  isPreview: boolean;
  duration: number | null;
  displayOrder: number;
  description?: string | null;
  selfPacedVideos?: CoursePreviewLessonVideoDto[];
  liveRecordedVideos?: CoursePreviewLessonVideoDto[];
}

export interface CoursePreviewLessonVideoDto {
  id: string;
  title: string;
  videoUrl: string | null;
  contentType: string;
  duration: number | null;
  displayOrder: number;
  description?: string | null;
  recordedAt?: string | null;
}

/** @deprecated Use CoursePreviewLessonVideoDto */
export type CoursePreviewSelfPacedVideoDto = CoursePreviewLessonVideoDto;

export interface CoursePreviewModule {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
  keySkills?: string[];
  lessons: CoursePreviewLesson[];
}

export interface CourseDto {
  id: string;
  code?: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  durationType: string | null;
  level: CourseLevel;
  language: string;
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  isPopular: boolean;
  categoryId?: string;
  category?: CourseCategory | null;
  branches?: CourseBranch[];
  status?: CourseStatus;
  previewModules?: CoursePreviewModule[];
  moduleCount?: number;
  lessonCount?: number;
  isEnrolled?: boolean | null;
  isAdmitted?: boolean | null;
  previewLessonCount?: number;
  resourceCount?: number;
  quizCount?: number;
  selfPacedVideoCount?: number;
  liveRecordedVideoCount?: number;
  updatedAt?: string;
}

export interface CourseSummary {
  courseId: string;
  batches: number;
  students: number;
  instructors: number;
  branches: number;
  modules: number;
  lessons: number;
  quizzes: number;
}

export interface GetCourseSummaryResponse {
  success: boolean;
  message: string;
  data: CourseSummary;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  durationType: string | null;
  level: CourseLevel;
  language: string;
  averageRating: number;
  totalReviews: number;
  categoryId: string;
  categoryName: string;
  branches: CourseBranch[];
  isFeatured: boolean;
  previewModules: CoursePreviewModule[];
  moduleCount: number;
  lessonCount: number;
  previewLessonCount: number;
  resourceCount: number;
  quizCount: number;
  selfPacedVideoCount: number;
  liveRecordedVideoCount: number;
  isEnrolled: boolean | null;
  isAdmitted: boolean | null;
  updatedAt: string | null;
  status: CourseStatus | null;
}

export interface GetCoursesParams {
  search?: string;
  categoryId?: string;
  branchId?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  skip?: number;
  take?: number;
}

export interface GetCoursesResponse {
  success: boolean;
  message: string;
  data: {
    items: CourseDto[];
    total: number;
  };
}

export interface GetCourseResponse {
  success: boolean;
  message: string;
  data: CourseDto;
}

export interface CourseFaq {
  id: string;
  courseId: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface GetCourseFaqsResponse {
  success: boolean;
  message: string;
  data: CourseFaq[];
}
