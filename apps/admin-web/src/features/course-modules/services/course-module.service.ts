import { apiClient } from "@/src/core/api/axios";

import type {
  ApiSuccessResponse,
  CourseModuleDetails,
  CourseModuleListItem,
  CourseModuleFilters,
  CreateCourseModuleRequest,
  CreateCourseModuleResponse,
  DeleteCourseModuleResponse,
  DeactivateCourseModuleResponse,
  MoveCourseModuleRequest,
  MoveCourseModuleResponse,
  RestoreCourseModuleResponse,
  UpdateCourseModuleRequest,
  UpdateCourseModuleResponse,
} from "@/src/features/course-modules/types/course-module.types";

class CourseModuleService {
  private readonly basePath =
    "/admin/course-modules";

  async createCourseModule(
    payload: CreateCourseModuleRequest
  ): Promise<
    ApiSuccessResponse<CreateCourseModuleResponse>
  > {
    const response =
      await apiClient.post<
        ApiSuccessResponse<CreateCourseModuleResponse>
      >(
        this.basePath,
        payload
      );

    return response.data;
  }

  async getCourseModules(
    filters: CourseModuleFilters
  ): Promise<
    ApiSuccessResponse<CourseModuleListItem[]>
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<CourseModuleListItem[]>
      >(this.basePath, {
        params: {
          courseId:
            filters.courseId,

          includeDeleted:
            filters.includeDeleted,
        },
      });

    return response.data;
  }

  async getCourseModule(
    moduleId: string
  ): Promise<
    ApiSuccessResponse<CourseModuleDetails>
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<CourseModuleDetails>
      >(
        `${this.basePath}/${moduleId}`
      );

    return response.data;
  }

  async updateCourseModule(
    moduleId: string,
    payload: UpdateCourseModuleRequest
  ): Promise<
    ApiSuccessResponse<UpdateCourseModuleResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<UpdateCourseModuleResponse>
      >(
        `${this.basePath}/${moduleId}`,
        payload
      );

    return response.data;
  }

  async moveCourseModule(
    moduleId: string,
    payload: MoveCourseModuleRequest
  ): Promise<
    ApiSuccessResponse<MoveCourseModuleResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<MoveCourseModuleResponse>
      >(
        `${this.basePath}/${moduleId}/move`,
        payload
      );

    return response.data;
  }

  async deleteCourseModule(
    moduleId: string
  ): Promise<
    ApiSuccessResponse<DeleteCourseModuleResponse>
  > {
    const response =
      await apiClient.delete<
        ApiSuccessResponse<DeleteCourseModuleResponse>
      >(
        `${this.basePath}/${moduleId}`
      );

    return response.data;
  }

  async deactivateCourseModule(
    moduleId: string
  ): Promise<
    ApiSuccessResponse<DeactivateCourseModuleResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<DeactivateCourseModuleResponse>
      >(
        `${this.basePath}/${moduleId}/deactivate`
      );

    return response.data;
  }

  async restoreCourseModule(
    moduleId: string
  ): Promise<
    ApiSuccessResponse<RestoreCourseModuleResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<RestoreCourseModuleResponse>
      >(
        `${this.basePath}/${moduleId}/restore`
      );

    return response.data;
  }
}

export const courseModuleService =
  new CourseModuleService();