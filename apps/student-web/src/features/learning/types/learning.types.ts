import type { ApiResponse } from "@/src/core/types/api-response.types";

export interface StudentCourseSummaryDto {
  courseId: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  level: string;
  language: string;
  enrollmentId: string;
  enrollmentNumber: string;
  enrollmentStatus: string;
  batchId: string;
  batchName: string;
}

export interface LessonResourceDto {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  displayOrder: number;
}

export interface LessonQuizDto {
  id: string;
  title: string;
  status: string;
  passingScore: number | null;
  timeLimitMinutes: number | null;
}

export interface LessonLearnItemDto {
  id: string;
  title: string;
  explanation: string;
  imageUrl: string | null;
  keyLearningPoints: string | null;
  finalThoughts: string | null;
  summary: string | null;
  displayOrder: number;
}

export interface LessonTreeDto {
  id: string;
  title: string;
  videoUrl: string | null;
  contentType: string;
  duration: number | null;
  displayOrder: number;
  isPreview: boolean;
  resources: LessonResourceDto[];
  learnItems: LessonLearnItemDto[];
  quiz: LessonQuizDto | null;
  description: string | null;
  parentLessonId: string | null;
}

export interface ModuleTreeDto {
  id: string;
  title: string;
  description: string | null;
  keySkills: string[];
  displayOrder: number;
  lessons: LessonTreeDto[];
  lessonCount: number;
  resourceCount: number;
  quizCount: number;
  assignmentCount: number;
  selfPacedVideoCount: number;
  liveRecordedVideoCount: number;
}

export interface CourseCategoryDto {
  id: string;
  name: string;
}

export interface CourseBranchDto {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface StudentCourseDetailDto {
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
  level: string;
  language: string;
  categoryId: string;
  category: CourseCategoryDto | null;
  categoryName?: string | null;
  branches: CourseBranchDto[];
  modules: ModuleTreeDto[];
  moduleCount: number;
  lessonCount: number;
  resourceCount?: number;
  quizCount?: number;
  selfPacedVideoCount?: number;
  liveRecordedVideoCount?: number;
}

export interface LessonProgressItemDto {
  lessonId: string;
  isCompleted: boolean;
  watchedSeconds: number;
  completedAt: string | null;
}

export interface CourseProgressDto {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  items: LessonProgressItemDto[];
}

export interface CourseCompletionDto {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  isCourseCompleted: boolean;
  certificateEligible: boolean;
}

export interface LessonProgressDto {
  isCompleted: boolean;
  watchedSeconds: number;
  completedAt: string | null;
}

export interface LessonDetailPayloadDto {
  lesson: LessonTreeDto;
  progress: LessonProgressDto | null;
}

export interface StudentCoursePayloadDto {
  course: StudentCourseDetailDto;
  progress: CourseProgressDto;
}

export interface EnrollmentDetailDto {
  id: string;
  enrollmentNumber: string;
  status: string;
  joiningDate: string | null;
  expectedCompletionDate: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    duration: number;
    durationType: string;
  };
  batch: {
    id: string;
    name: string;
    code: string;
    startDate: string | null;
    endDate: string | null;
    startTime: string | null;
    endTime: string | null;
    mode: string | null;
  };
  branch: {
    id: string;
    branchName: string;
    branchCode: string;
  };
  category: {
    id: string;
    name: string;
  } | null;
}

export interface StudentProfileDto {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  status: string;
}

export type StudentCoursesResponse = ApiResponse<StudentCourseSummaryDto[]>;
export type StudentCourseResponse = ApiResponse<StudentCoursePayloadDto>;
export type ModuleTreeResponse = ApiResponse<ModuleTreeDto>;
export type LessonDetailResponse = ApiResponse<LessonDetailPayloadDto>;
export type CourseProgressResponse = ApiResponse<CourseProgressDto>;
export type CourseCompletionResponse = ApiResponse<CourseCompletionDto>;
export type EnrollmentsResponse = ApiResponse<EnrollmentDetailDto[]>;
export type StudentProfileResponse = ApiResponse<StudentProfileDto | null>;
export type ResourceDownloadResponse = ApiResponse<{
  resourceId: string;
  title: string;
  fileUrl: string;
}>;
