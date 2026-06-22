// src/features/course-lessons/services/course-lesson.service.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  CourseLessonListResponse,
  CourseLessonResponse,
  CreateCourseLessonRequest,
  DeleteCourseLessonResponse,
  MoveCourseLessonRequest,
  UpdateCourseLessonRequest,
} from "@/src/features/course-lessons/types";

class CourseLessonService {
  async getCourseLessons() {
    const { data } =
      await apiClient.get<CourseLessonListResponse>(
        "/admin/course-lessons",
      );

    return data;
  }

  async createCourseLesson(
    payload: CreateCourseLessonRequest,
  ) {
    const { data } =
      await apiClient.post<CourseLessonResponse>(
        "/admin/course-lessons",
        payload,
      );

    return data;
  }

  async updateCourseLesson(
    id: string,
    payload: UpdateCourseLessonRequest,
  ) {
    const { data } =
      await apiClient.patch<CourseLessonResponse>(
        `/admin/course-lessons/${id}`,
        payload,
      );

    return data;
  }

  async moveCourseLesson(
    id: string,
    payload: MoveCourseLessonRequest,
  ) {
    const { data } =
      await apiClient.patch<CourseLessonResponse>(
        `/admin/course-lessons/${id}/move`,
        payload,
      );

    return data;
  }

  async deleteCourseLesson(
    id: string,
  ) {
    const { data } =
      await apiClient.delete<DeleteCourseLessonResponse>(
        `/admin/course-lessons/${id}`,
      );

    return data;
  }

  async restoreCourseLesson(
    id: string,
  ) {
    const { data } =
      await apiClient.patch<CourseLessonResponse>(
        `/admin/course-lessons/${id}/restore`,
      );

    return data;
  }
}

export const courseLessonService =
  new CourseLessonService();