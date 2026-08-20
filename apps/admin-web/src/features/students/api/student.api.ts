import { apiClient } from "@/src/core/api/axios";

import type {
  ApiSuccessResponse,
  BulkStudentOperationResult,
  CreateStudentRequest,
  Student,
  StudentFilters,
  StudentListResponse,
  SuggestStudentCodeResponse,
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";
import { buildStudentListQueryParams } from "@/src/features/students/utils/student-list.utils";

export const studentApi = {
  async getStudents(filters?: StudentFilters) {
    const response = await apiClient.get<
      ApiSuccessResponse<StudentListResponse | Student[]>
    >("/admin/students", {
      params: buildStudentListQueryParams(filters),
    });

    return response.data;
  },

  async getStudent(id: string) {
    const response = await apiClient.get<ApiSuccessResponse<Student>>(
      `/admin/students/${id}`,
    );

    return response.data;
  },

  async suggestStudentCode() {
    const response = await apiClient.get<
      ApiSuccessResponse<SuggestStudentCodeResponse>
    >("/admin/students/suggest-code");

    return response.data;
  },

  async createStudent(payload: CreateStudentRequest) {
    const response = await apiClient.post<ApiSuccessResponse<Student>>(
      "/admin/students",
      payload,
    );

    return response.data;
  },

  async updateStudent(id: string, payload: UpdateStudentRequest) {
    const response = await apiClient.patch<ApiSuccessResponse<Student>>(
      `/admin/students/${id}`,
      payload,
    );

    return response.data;
  },

  async activateStudent(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<Student>>(
      `/admin/students/${id}/activate`,
    );

    return response.data;
  },

  async deactivateStudent(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<Student>>(
      `/admin/students/${id}/deactivate`,
    );

    return response.data;
  },

  async restoreStudent(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<Student>>(
      `/admin/students/${id}/restore`,
    );

    return response.data;
  },

  async deleteStudent(id: string) {
    const response = await apiClient.delete<ApiSuccessResponse<Student>>(
      `/admin/students/${id}`,
    );

    return response.data;
  },

  async permanentDeleteStudent(id: string) {
    const response = await apiClient.delete<ApiSuccessResponse<Student>>(
      `/admin/students/${id}/permanent`,
    );

    return response.data;
  },

  async bulkActivate(studentIds: string[]) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BulkStudentOperationResult>
    >("/admin/students/bulk/activate", { studentIds });

    return response.data;
  },

  async bulkDeactivate(studentIds: string[]) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BulkStudentOperationResult>
    >("/admin/students/bulk/deactivate", { studentIds });

    return response.data;
  },

  async bulkDelete(studentIds: string[]) {
    const response = await apiClient.delete<
      ApiSuccessResponse<BulkStudentOperationResult>
    >("/admin/students/bulk", { data: { studentIds } });

    return response.data;
  },

  async bulkRestore(studentIds: string[]) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BulkStudentOperationResult>
    >("/admin/students/bulk/restore", { studentIds });

    return response.data;
  },

  async bulkPermanentDelete(studentIds: string[]) {
    const response = await apiClient.delete<
      ApiSuccessResponse<BulkStudentOperationResult>
    >("/admin/students/bulk/permanent", { data: { studentIds } });

    return response.data;
  },
};
