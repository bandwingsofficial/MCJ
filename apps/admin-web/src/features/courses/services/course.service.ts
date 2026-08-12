// src/features/courses/services/course.service.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  ActivateCourseResponse,
  ApiSuccessResponse,
  CourseDetails,
  CourseFilters,
  CourseListItem,
  CourseListResponse,
  CreateCourseRequest,
  DeactivateCourseResponse,
  DeleteCourseResponse,
  PermanentDeleteCourseResponse,
  RestoreCourseResponse,
  UpdateCourseRequest,
} from "@/src/features/courses/types/course.types";

class CourseService {
  private readonly basePath =
    "/admin/courses";

 async createCourse(
  payload: CreateCourseRequest
): Promise<
  ApiSuccessResponse<CourseDetails>
> {
  const response =
    await apiClient.post<
      ApiSuccessResponse<CourseDetails>
    >(
      this.basePath,
      payload
    );

  return response.data;
}
  async getCourses(
  filters: CourseFilters
): Promise<
  ApiSuccessResponse<
    CourseListItem[]
  >
> {
    const response =
  await apiClient.get<
    ApiSuccessResponse<
      CourseListItem[]
    >
  >(this.basePath, {
        params: {
          search:
            filters.search ||
            undefined,

          status:
            filters.status ||
            undefined,

          branchId:
            filters.branchId ||
            undefined,

          includeDeleted:
            filters.includeDeleted,

          skip:
            filters.skip,

          take:
            filters.take,
        },
      });

    return response.data;
  }

  async getCourse(
    id: string
  ): Promise<
    ApiSuccessResponse<CourseDetails>
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<CourseDetails>
      >(
        `${this.basePath}/${id}`
      );

    return response.data;
  }

  async updateCourse(
    id: string,
    payload: UpdateCourseRequest
  ): Promise<
    ApiSuccessResponse<CourseDetails>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<CourseDetails>
      >(
        `${this.basePath}/${id}`,
        payload
      );

    return response.data;
  }

  async activateCourse(
    id: string
  ): Promise<
    ApiSuccessResponse<ActivateCourseResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<ActivateCourseResponse>
      >(
        `${this.basePath}/${id}/activate`
      );

    return response.data;
  }

  async deactivateCourse(
    id: string
  ): Promise<
    ApiSuccessResponse<DeactivateCourseResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<DeactivateCourseResponse>
      >(
        `${this.basePath}/${id}/deactivate`
      );

    return response.data;
  }

  async restoreCourse(
    id: string
  ): Promise<
    ApiSuccessResponse<RestoreCourseResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<RestoreCourseResponse>
      >(
        `${this.basePath}/${id}/restore`
      );

    return response.data;
  }

  async deleteCourse(
    id: string
  ): Promise<
    ApiSuccessResponse<DeleteCourseResponse>
  > {
    const response =
      await apiClient.delete<
        ApiSuccessResponse<DeleteCourseResponse>
      >(
        `${this.basePath}/${id}`
      );

    return response.data;
  }

  async permanentlyDeleteCourse(
    id: string
  ): Promise<
    ApiSuccessResponse<PermanentDeleteCourseResponse>
  > {
    const response =
      await apiClient.delete<
        ApiSuccessResponse<PermanentDeleteCourseResponse>
      >(
        `${this.basePath}/${id}/permanent`
      );

    return response.data;
  }

  async uploadCourseImage(file: File){
   const formData = new FormData();

formData.append("file", file);
formData.append("folder", "courses");
formData.append("fileName", file.name);

const response = await apiClient.post(
  "/admin/uploads",
  formData,
  {
    headers: {
      "Content-Type": undefined,
    },
    transformRequest: [(data) => data],
  }
);

return response.data;
}
}

export const courseService =
  new CourseService();