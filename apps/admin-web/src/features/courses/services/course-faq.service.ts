import { AxiosError } from "axios";

import { apiClient } from "@/src/core/api/axios";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type {
  ApiSuccessResponse,
  CourseFaq,
  CreateCourseFaqRequest,
  ReorderCourseFaqsRequest,
  UpdateCourseFaqRequest,
} from "@/src/features/courses/types/course-faq.types";

class CourseFaqService {
  private basePath(courseId: string) {
    return `/admin/courses/${courseId}/faqs`;
  }

  async list(courseId: string) {
    try {
      const response = await apiClient.get<ApiSuccessResponse<CourseFaq[]>>(
        this.basePath(courseId),
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(courseId: string, payload: CreateCourseFaqRequest) {
    try {
      const response = await apiClient.post<ApiSuccessResponse<CourseFaq>>(
        this.basePath(courseId),
        payload,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(
    courseId: string,
    faqId: string,
    payload: UpdateCourseFaqRequest,
  ) {
    try {
      const response = await apiClient.patch<ApiSuccessResponse<CourseFaq>>(
        `${this.basePath(courseId)}/${faqId}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async permanentDelete(courseId: string, faqId: string) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<{ id: string; permanentlyDeleted: boolean }>
      >(`${this.basePath(courseId)}/${faqId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reorder(courseId: string, payload: ReorderCourseFaqsRequest) {
    try {
      const response = await apiClient.patch<ApiSuccessResponse<CourseFaq[]>>(
        `${this.basePath(courseId)}/reorder`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      return new Error(getErrorMessage(error));
    }

    return new Error(
      error instanceof Error ? error.message : "Unexpected error occurred",
    );
  }
}

export const courseFaqService = new CourseFaqService();
