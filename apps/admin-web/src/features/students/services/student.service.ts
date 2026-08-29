import { toApiClientError } from "@/src/core/utils/get-error-message";
import { apiClient } from "@/src/core/api/axios";

import { studentApi } from "@/src/features/students/api/student.api";
import { branchService } from "@/src/features/branches/services/branch.service";
import type {
  BranchOption,
  CreateStudentDocumentRequest,
  CreateStudentRequest,
  StudentFilters,
  UpdateStudentDocumentRequest,
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";

const FORM_OPTIONS_PAGE_SIZE = 100;

class StudentService {
  private handleError(error: unknown): Error {
    return toApiClientError(error);
  }

  async getStudents(filters?: StudentFilters) {
    try {
      return await studentApi.getStudents(filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStudent(id: string) {
    try {
      return await studentApi.getStudent(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async suggestStudentCode() {
    try {
      return await studentApi.suggestStudentCode();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createStudent(payload: CreateStudentRequest) {
    try {
      return await studentApi.createStudent(payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStudent(id: string, payload: UpdateStudentRequest) {
    try {
      return await studentApi.updateStudent(id, payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async activateStudent(id: string) {
    try {
      return await studentApi.activateStudent(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deactivateStudent(id: string) {
    try {
      return await studentApi.deactivateStudent(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreStudent(id: string) {
    try {
      return await studentApi.restoreStudent(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteStudent(id: string) {
    try {
      return await studentApi.deleteStudent(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async permanentDeleteStudent(id: string) {
    try {
      return await studentApi.permanentDeleteStudent(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkActivate(studentIds: string[]) {
    try {
      return await studentApi.bulkActivate(studentIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDeactivate(studentIds: string[]) {
    try {
      return await studentApi.bulkDeactivate(studentIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDelete(studentIds: string[]) {
    try {
      return await studentApi.bulkDelete(studentIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkRestore(studentIds: string[]) {
    try {
      return await studentApi.bulkRestore(studentIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkPermanentDelete(studentIds: string[]) {
    try {
      return await studentApi.bulkPermanentDelete(studentIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStudentDocuments(studentId: string) {
    try {
      return await studentApi.getStudentDocuments(studentId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createStudentDocument(
    studentId: string,
    payload: CreateStudentDocumentRequest,
  ) {
    try {
      return await studentApi.createStudentDocument(studentId, payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStudentDocument(
    studentId: string,
    documentId: string,
    payload: UpdateStudentDocumentRequest,
  ) {
    try {
      return await studentApi.updateStudentDocument(
        studentId,
        documentId,
        payload,
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteStudentDocument(studentId: string, documentId: string) {
    try {
      return await studentApi.deleteStudentDocument(studentId, documentId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadStudentDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "student-documents");
    formData.append("fileName", file.name);

    const response = await apiClient.post("/admin/uploads", formData, {
      headers: { "Content-Type": undefined },
      transformRequest: [(data) => data],
    });

    return response.data;
  }

  async getBranches(): Promise<BranchOption[]> {
    try {
      const response = await branchService.getBranches({
        status: "ACTIVE",
        page: 1,
        pageSize: FORM_OPTIONS_PAGE_SIZE,
        includeDeleted: false,
      });

      return (response.data.items ?? []).map((branch) => ({
        id: branch.id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadStudentImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "students");
    formData.append("fileName", file.name);

    const response = await apiClient.post("/admin/uploads", formData, {
      headers: { "Content-Type": undefined },
      transformRequest: [(data) => data],
    });

    return response.data;
  }
}

export const studentService = new StudentService();
