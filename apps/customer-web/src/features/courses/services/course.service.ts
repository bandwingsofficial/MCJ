// src/features/courses/services/course.service.ts

import { AxiosError } from "axios";

import {
  getCoursesApi,
  getCourseBySlugApi,
  getCourseByIdApi,
  getCourseSummaryApi,
} from "@/src/features/courses/api/course.api";

import {
  mapCourseDtoToCourse,
  mapCourseDtosToCourses,
} from "@/src/features/courses/mappers/course.mapper";

import type {
  Course,
  CourseSummary,
  GetCoursesParams,
} from "@/src/features/courses/types/course.types";
import { isCourseUuid } from "@/src/features/courses/utils/course-route.utils";

export async function getCourses(
  params?: GetCoursesParams,
): Promise<Course[]> {
  try {
    const response = await getCoursesApi(params);
    const items = response.data?.items ?? response.data ?? [];

    return mapCourseDtosToCourses(
      Array.isArray(items) ? items : [],
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }

    throw new Error("Failed to fetch courses");
  }
}

export async function getCourseBySlug(slug: string): Promise<Course> {
  try {
    const response = await getCourseBySlugApi(slug);

    return mapCourseDtoToCourse(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }

    throw new Error("Failed to fetch course");
  }
}

export async function getCourseById(id: string): Promise<Course> {
  try {
    const response = await getCourseByIdApi(id);

    return mapCourseDtoToCourse(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }

    throw new Error("Failed to fetch course");
  }
}

export async function getCourse(identifier: string): Promise<Course> {
  if (isCourseUuid(identifier)) {
    return getCourseById(identifier);
  }

  return getCourseBySlug(identifier);
}

export async function getCourseSummary(id: string): Promise<CourseSummary> {
  try {
    const response = await getCourseSummaryApi(id);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }

    throw new Error("Failed to fetch course summary");
  }
}
