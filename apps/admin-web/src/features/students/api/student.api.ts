import { apiClient } from "@/src/core/api/axios";

import type {
  ApiSuccessResponse,
  BulkStudentOperationResult,
  CreateStudentDocumentRequest,
  CreateStudentRequest,
  Student,
  StudentDocument,
  StudentFilters,
  StudentListResponse,
  SuggestStudentCodeResponse,
  UpdateStudentDocumentRequest,
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";
import type { StudentAssessmentOverview } from "@/src/features/students/types/student-assessment.types";
import { buildStudentListQueryParams } from "@/src/features/students/utils/student-list.utils";
import {
  syncStudentImageFields,
  syncStudentImageList,
} from "@/src/shared/utils/entity-image-sync.util";

export const studentApi = {
  async getStudents(filters?: StudentFilters) {
    const response = await apiClient.get<
      ApiSuccessResponse<StudentListResponse | Student[]>
    >("/admin/students", {
      params: buildStudentListQueryParams(filters),
    });

    const payload = response.data;

    if (Array.isArray(payload.data)) {
      return {
        ...payload,
        data: syncStudentImageList(payload.data),
      };
    }

    if (
      payload.data &&
      typeof payload.data === "object" &&
      "items" in payload.data &&
      Array.isArray(payload.data.items)
    ) {
      return {
        ...payload,
        data: {
          ...payload.data,
          items: syncStudentImageList(payload.data.items),
        },
      };
    }

    return payload;
  },

  async getStudent(id: string) {
    const response = await apiClient.get<ApiSuccessResponse<Student>>(
      `/admin/students/${id}`,
    );

    return {
      ...response.data,
      data: syncStudentImageFields(response.data.data),
    };
  },

  async getStudentAssessments(id: string) {
    const response = await apiClient.get<
      ApiSuccessResponse<StudentAssessmentOverview>
    >(`/admin/students/${id}/assessments`);

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

    return {
      ...response.data,
      data: syncStudentImageFields(response.data.data),
    };
  },

  async updateStudent(id: string, payload: UpdateStudentRequest) {
    const response = await apiClient.patch<ApiSuccessResponse<Student>>(
      `/admin/students/${id}`,
      payload,
    );

    return {
      ...response.data,
      data: syncStudentImageFields(response.data.data),
    };
  },

  async activateStudent(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<Student>>(
      `/admin/students/${id}/activate`,
    );

    return {
      ...response.data,
      data: syncStudentImageFields(response.data.data),
    };
  },

  async deactivateStudent(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<Student>>(
      `/admin/students/${id}/deactivate`,
    );

    return {
      ...response.data,
      data: syncStudentImageFields(response.data.data),
    };
  },

  async restoreStudent(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<Student>>(
      `/admin/students/${id}/restore`,
    );

    return {
      ...response.data,
      data: syncStudentImageFields(response.data.data),
    };
  },

  async deleteStudent(id: string) {
    const response = await apiClient.delete<
      ApiSuccessResponse<Student>
    >(`/admin/students/${id}`);

    return response.data;
  },

  async permanentDeleteStudent(id: string) {
    const response = await apiClient.delete<
      ApiSuccessResponse<Student>
    >(`/admin/students/${id}/permanent`);

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

  async getStudentDocuments(studentId: string) {
    const response = await apiClient.get<
      ApiSuccessResponse<StudentDocument[]>
    >(`/admin/students/${studentId}/documents`);

    return response.data;
  },

  async createStudentDocument(
    studentId: string,
    payload: CreateStudentDocumentRequest,
  ) {
    const response = await apiClient.post<
      ApiSuccessResponse<StudentDocument>
    >(`/admin/students/${studentId}/documents`, payload);

    return response.data;
  },

  async updateStudentDocument(
    studentId: string,
    documentId: string,
    payload: UpdateStudentDocumentRequest,
  ) {
    const response = await apiClient.patch<
      ApiSuccessResponse<StudentDocument>
    >(`/admin/students/${studentId}/documents/${documentId}`, payload);

    return response.data;
  },

  async deleteStudentDocument(studentId: string, documentId: string) {
    const response = await apiClient.delete<
      ApiSuccessResponse<{ id: string; permanentlyDeleted: boolean }>
    >(`/admin/students/${studentId}/documents/${documentId}`);

    return response.data;
  },
};
