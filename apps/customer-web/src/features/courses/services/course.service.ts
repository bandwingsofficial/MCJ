// src/features/courses/services/course.service.ts

import { AxiosError } from "axios";

import {
  getCoursesApi,
  getCourseBySlugApi,
} from "@/src/features/courses/api/course.api";

import {
  mapCourseDtoToCourse,
  mapCourseDtosToCourses,
} from "@/src/features/courses/mappers/course.mapper";

import type {
  Course,
  GetCoursesParams,
} from "@/src/features/courses/types/course.types";

export async function getCourses(
  params?: GetCoursesParams
): Promise<Course[]> {
  try {
    const response =
      await getCoursesApi(
        params
      );

    return mapCourseDtosToCourses(
      response.data
    );
  } catch (error) {
    if (
      error instanceof AxiosError
    ) {
      throw error;
    }

    throw new Error(
      "Failed to fetch courses"
    );
  }
}

export async function getCourseBySlug(
  slug: string
): Promise<Course> {
  try {
    const response =
      await getCourseBySlugApi(
        slug
      );

    return mapCourseDtoToCourse(
      response.data
    );
  } catch (error) {
    if (
      error instanceof AxiosError
    ) {
      throw error;
    }

    throw new Error(
      "Failed to fetch course"
    );
  }
}