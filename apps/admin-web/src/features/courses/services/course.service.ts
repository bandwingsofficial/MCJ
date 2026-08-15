import { AxiosError } from "axios";

import { apiClient } from "@/src/core/api/axios";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type {
  ActivateCourseResponse,
  ApiSuccessResponse,
  BulkCourseOperationResult,
  CourseDetails,
  CourseFilters,
  CourseListItem,
  CourseListResponse,
  CourseSummary,
  CreateCourseRequest,
  DeactivateCourseResponse,
  DeleteCourseResponse,
  PermanentDeleteCourseResponse,
  RestoreCourseResponse,
  UpdateCourseRequest,
} from "@/src/features/courses/types/course.types";

const DEFAULT_PAGE_SIZE = 20;

function normalizeListResponse(
  data: CourseListResponse | CourseListItem[]
): CourseListResponse {
  if (Array.isArray(data)) {
    return {
      items: data,
      count: data.length,
    };
  }

  return {
    items: data.items ?? [],
    count:
      data.meta?.total ??
      data.count ??
      data.items?.length ??
      0,
    meta: data.meta,
  };
}

function buildListParams(filters?: CourseFilters) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * pageSize;
  const status = filters?.status;
  const isArchivedFilter = status === "ARCHIVED";

  return {
    search: filters?.search?.trim() || undefined,
    categoryId: filters?.categoryId || undefined,
    branchId: filters?.branchId || undefined,
    level: filters?.level || undefined,
    status: isArchivedFilter ? "ARCHIVED" : status || undefined,
    includeDeleted: isArchivedFilter
      ? true
      : status != null
        ? undefined
        : false,
    skip,
    take: pageSize,
  };
}

class CourseService {
  private readonly basePath = "/admin/courses";

  async createCourse(
    payload: CreateCourseRequest
  ): Promise<ApiSuccessResponse<CourseDetails>> {
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<CourseDetails>
      >(this.basePath, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCourses(filters?: CourseFilters) {
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<
          CourseListResponse | CourseListItem[]
        >
      >(this.basePath, {
        params: buildListParams(filters),
      });

      return {
        ...response.data,
        data: normalizeListResponse(response.data.data),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCourse(
    id: string
  ): Promise<ApiSuccessResponse<CourseDetails>> {
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<CourseDetails>
      >(`${this.basePath}/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCourseSummary(id: string) {
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<CourseSummary>
      >(`${this.basePath}/${id}/summary`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCourse(
    id: string,
    payload: UpdateCourseRequest
  ): Promise<ApiSuccessResponse<CourseDetails>> {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<CourseDetails>
      >(`${this.basePath}/${id}`, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async activateCourse(
    id: string
  ): Promise<ApiSuccessResponse<ActivateCourseResponse>> {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<ActivateCourseResponse>
      >(`${this.basePath}/${id}/activate`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deactivateCourse(
    id: string
  ): Promise<ApiSuccessResponse<DeactivateCourseResponse>> {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<DeactivateCourseResponse>
      >(`${this.basePath}/${id}/deactivate`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreCourse(
    id: string
  ): Promise<ApiSuccessResponse<RestoreCourseResponse>> {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<RestoreCourseResponse>
      >(`${this.basePath}/${id}/restore`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCourse(
    id: string
  ): Promise<ApiSuccessResponse<DeleteCourseResponse>> {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<DeleteCourseResponse>
      >(`${this.basePath}/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async permanentlyDeleteCourse(
    id: string
  ): Promise<ApiSuccessResponse<PermanentDeleteCourseResponse>> {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<PermanentDeleteCourseResponse>
      >(`${this.basePath}/${id}/permanent`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reorderCourses(payload: {
    courseId: string;
    newDisplayOrder: number;
  }) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<{
          courseId: string;
          displayOrder: number;
        }>
      >(`${this.basePath}/reorder`, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkActivate(courseIds: string[]) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<BulkCourseOperationResult>
      >(`${this.basePath}/bulk/status`, {
        courseIds,
        status: "ACTIVE",
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDeactivate(courseIds: string[]) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<BulkCourseOperationResult>
      >(`${this.basePath}/bulk/status`, {
        courseIds,
        status: "INACTIVE",
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDelete(courseIds: string[]) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<BulkCourseOperationResult>
      >(`${this.basePath}/bulk`, {
        data: { courseIds },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkRestore(courseIds: string[]) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<BulkCourseOperationResult>
      >(`${this.basePath}/bulk/restore`, {
        courseIds,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkPermanentDelete(courseIds: string[]) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<BulkCourseOperationResult>
      >(`${this.basePath}/bulk/permanent`, {
        data: { courseIds },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadCourseImage(file: File) {
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

  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      return new Error(getErrorMessage(error));
    }

    return new Error(
      error instanceof Error
        ? error.message
        : "Unexpected error occurred"
    );
  }
}

export const courseService = new CourseService();
