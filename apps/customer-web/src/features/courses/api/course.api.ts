// src/features/courses/api/course.api.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  GetCourseResponse,
  GetCoursesParams,
  GetCoursesResponse,
} from "@/src/features/courses/types/course.types";

export async function getCoursesApi(
  params?: GetCoursesParams
): Promise<GetCoursesResponse> {
  const response =
    await apiClient.get<GetCoursesResponse>(
      "/courses",
      {
        params,
      }
    );

  return response.data;
}

export async function getCourseBySlugApi(
  slug: string
): Promise<GetCourseResponse> {
  const response =
    await apiClient.get<GetCourseResponse>(
      `/courses/slug/${slug}`
    );

  return response.data;
}