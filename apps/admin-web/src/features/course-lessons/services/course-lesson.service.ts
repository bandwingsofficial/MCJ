// src/features/course-lessons/services/course-lesson.service.ts

import { apiClient } from "@/src/core/api/axios";

import type {
    GetCourseLessonsRequest,
  CourseLessonListResponse,
  CourseLessonResponse,
  CreateCourseLessonRequest,
  DeleteCourseLessonResponse,
  MoveCourseLessonRequest,
  UpdateCourseLessonRequest,
} from "@/src/features/course-lessons/types";

class CourseLessonService {
  private readonly basePath =
    "/admin/course-lessons";

  async getCourseLessons(
    filters: GetCourseLessonsRequest,
  ) {
    const { data } =
      await apiClient.get<CourseLessonListResponse>(
        this.basePath,
        {
          params: {
  moduleId: filters.moduleId,

  includeDeleted:
    filters.includeDeleted,
},
        },
      );

    return data;
  }

  async createCourseLesson(
    payload: CreateCourseLessonRequest,
  ) {
    const { data } =
      await apiClient.post<CourseLessonResponse>(
        this.basePath,
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
        `${this.basePath}/${id}`,
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
        `${this.basePath}/${id}/move`,
        payload,
      );

    return data;
  }

  async deleteCourseLesson(
    id: string,
  ) {
    const { data } =
      await apiClient.delete<DeleteCourseLessonResponse>(
        `${this.basePath}/${id}`,
      );

    return data;
  }

  async restoreCourseLesson(
    id: string,
  ) {
    const { data } =
      await apiClient.patch<CourseLessonResponse>(
        `${this.basePath}/${id}/restore`,
      );

    return data;
  }
}

export const courseLessonService =
  new CourseLessonService();