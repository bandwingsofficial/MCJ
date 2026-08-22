// src/features/courses/api/course.api.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  GetCourseResponse,
  GetCoursesParams,
  GetCoursesResponse,
  GetCourseSummaryResponse,
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

export async function getCourseByIdApi(
  id: string,
): Promise<GetCourseResponse> {
  const response = await apiClient.get<GetCourseResponse>(`/courses/${id}`);
  return response.data;
}

export async function getCourseSummaryApi(
  id: string,
): Promise<GetCourseSummaryResponse> {
  const response = await apiClient.get<GetCourseSummaryResponse>(
    `/courses/${id}/summary`,
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