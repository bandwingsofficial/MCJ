import { apiClient } from "@/src/core/api/axios";

import type {
  CourseCompletionResponse,
  CourseProgressResponse,
  EnrollmentsResponse,
  LessonDetailResponse,
  ModuleTreeResponse,
  ResourceDownloadResponse,
  StudentCourseResponse,
  StudentCoursesResponse,
  StudentLessonQuizResponse,
  StudentProfileResponse,
  StudentQuizSubmitResponse,
} from "@/src/features/learning/types/learning.types";

export const learningApi = {
  getStudentProfile() {
    return apiClient.get<StudentProfileResponse>("/students/me");
  },

  listCourses() {
    return apiClient.get<StudentCoursesResponse>("/student/courses");
  },

  getMyEnrollments() {
    return apiClient.get<EnrollmentsResponse>("/enrollments/me");
  },

  getCourse(courseId: string) {
    return apiClient.get<StudentCourseResponse>(
      `/student/courses/${courseId}`,
    );
  },

  getModule(courseId: string, moduleId: string) {
    return apiClient.get<ModuleTreeResponse>(
      `/student/courses/${courseId}/modules/${moduleId}`,
    );
  },

  getLesson(courseId: string, lessonId: string) {
    return apiClient.get<LessonDetailResponse>(
      `/student/courses/${courseId}/lessons/${lessonId}`,
    );
  },

  getCourseProgress(courseId: string) {
    return apiClient.get<CourseProgressResponse>(
      `/student/courses/${courseId}/progress`,
    );
  },

  getCourseCompletion(courseId: string) {
    return apiClient.get<CourseCompletionResponse>(
      `/student/courses/${courseId}/completion`,
    );
  },

  updateLessonProgress(
    courseId: string,
    lessonId: string,
    payload: { isCompleted?: boolean; watchedSeconds?: number },
  ) {
    return apiClient.patch(
      `/student/courses/${courseId}/lessons/${lessonId}/progress`,
      payload,
    );
  },

  downloadResource(resourceId: string, courseId: string) {
    return apiClient.get<ResourceDownloadResponse>(
      `/student/resources/${resourceId}/download`,
      { params: { courseId } },
    );
  },

  getLessonQuiz(courseId: string, lessonId: string) {
    return apiClient.get<StudentLessonQuizResponse>(
      `/student/courses/${courseId}/lessons/${lessonId}/quiz`,
    );
  },

  submitLessonQuiz(
    courseId: string,
    lessonId: string,
    payload: {
      answers: Array<{
        questionId: string;
        selectedOptionIds: string[];
      }>;
    },
  ) {
    return apiClient.patch<StudentQuizSubmitResponse>(
      `/student/courses/${courseId}/lessons/${lessonId}/quiz/submit`,
      payload,
    );
  },
};
