import { apiClient } from "@/src/core/api/axios";

import type {
  ApiSuccessResponse,
  CourseResourceDetails,
  CourseResourceFilters,
  CourseResourceListItem,
  CreateCourseResourceRequest,
  CreateCourseResourceResponse,
  DeleteCourseResourceResponse,
  MoveCourseResourceRequest,
  MoveCourseResourceResponse,
  RestoreCourseResourceResponse,
  UpdateCourseResourceRequest,
  UpdateCourseResourceResponse,
} from "@/src/features/course-resources/types";

class CourseResourceService {
  private readonly basePath =
    "/admin/course-resources";

  async createCourseResource(
    payload: CreateCourseResourceRequest,
  ): Promise<
    ApiSuccessResponse<CreateCourseResourceResponse>
  > {
    const response =
      await apiClient.post<
        ApiSuccessResponse<CreateCourseResourceResponse>
      >(
        this.basePath,
        payload,
      );

    return response.data;
  }

  async getCourseResources(
    filters: CourseResourceFilters,
  ): Promise<
    ApiSuccessResponse<CourseResourceListItem[]>
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<CourseResourceListItem[]>
      >(this.basePath, {
        params: {
          lessonId:
            filters.lessonId,

          includeDeleted:
            filters.includeDeleted,
        },
      });

    return response.data;
  }

  async getCourseResource(
    resourceId: string,
  ): Promise<
    ApiSuccessResponse<CourseResourceDetails>
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<CourseResourceDetails>
      >(
        `${this.basePath}/${resourceId}`,
      );

    return response.data;
  }

  async updateCourseResource(
    resourceId: string,
    payload: UpdateCourseResourceRequest,
  ): Promise<
    ApiSuccessResponse<UpdateCourseResourceResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<UpdateCourseResourceResponse>
      >(
        `${this.basePath}/${resourceId}`,
        payload,
      );

    return response.data;
  }

  async moveCourseResource(
    resourceId: string,
    payload: MoveCourseResourceRequest,
  ): Promise<
    ApiSuccessResponse<MoveCourseResourceResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<MoveCourseResourceResponse>
      >(
        `${this.basePath}/${resourceId}/move`,
        payload,
      );

    return response.data;
  }

  async deleteCourseResource(
    resourceId: string,
  ): Promise<
    ApiSuccessResponse<DeleteCourseResourceResponse>
  > {
    const response =
      await apiClient.delete<
        ApiSuccessResponse<DeleteCourseResourceResponse>
      >(
        `${this.basePath}/${resourceId}`,
      );

    return response.data;
  }

  async restoreCourseResource(
    resourceId: string,
  ): Promise<
    ApiSuccessResponse<RestoreCourseResourceResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<RestoreCourseResourceResponse>
      >(
        `${this.basePath}/${resourceId}/restore`,
      );

    return response.data;
  }
}

export const courseResourceService =
  new CourseResourceService();