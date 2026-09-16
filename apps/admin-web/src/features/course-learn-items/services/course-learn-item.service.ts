import { apiClient } from "@/src/core/api/axios";

import type {
  ApiSuccessResponse,
  CourseLearnItem,
  CourseLearnItemFilters,
  CreateCourseLearnItemRequest,
  MoveCourseLearnItemRequest,
  UpdateCourseLearnItemRequest,
} from "@/src/features/course-learn-items/types";

class CourseLearnItemService {
  private readonly basePath = "/admin/course-learn-items";

  async createCourseLearnItem(payload: CreateCourseLearnItemRequest) {
    const response = await apiClient.post<
      ApiSuccessResponse<CourseLearnItem>
    >(this.basePath, payload);

    return response.data;
  }

  async getCourseLearnItems(filters: CourseLearnItemFilters) {
    const response = await apiClient.get<
      ApiSuccessResponse<CourseLearnItem[]>
    >(this.basePath, {
      params: {
        lessonId: filters.lessonId,
        search: filters.search,
      },
    });

    return response.data;
  }

  async getCourseLearnItem(id: string) {
    const response = await apiClient.get<
      ApiSuccessResponse<CourseLearnItem>
    >(`${this.basePath}/${id}`);

    return response.data;
  }

  async updateCourseLearnItem(
    id: string,
    payload: UpdateCourseLearnItemRequest,
  ) {
    const response = await apiClient.patch<
      ApiSuccessResponse<CourseLearnItem>
    >(`${this.basePath}/${id}`, payload);

    return response.data;
  }

  async moveCourseLearnItem(
    id: string,
    payload: MoveCourseLearnItemRequest,
  ) {
    const response = await apiClient.patch<
      ApiSuccessResponse<CourseLearnItem>
    >(`${this.basePath}/${id}/move`, payload);

    return response.data;
  }

  async deleteCourseLearnItem(id: string) {
    const response = await apiClient.delete<
      ApiSuccessResponse<{ id: string; deleted: boolean }>
    >(`${this.basePath}/${id}`);

    return response.data;
  }

  async uploadLearnItemImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "course-learn-items");
    formData.append("fileName", file.name);

    const response = await apiClient.post("/admin/uploads", formData, {
      headers: {
        "Content-Type": undefined,
      },
      transformRequest: [(data) => data],
    });

    return response.data;
  }
}

export const courseLearnItemService = new CourseLearnItemService();
