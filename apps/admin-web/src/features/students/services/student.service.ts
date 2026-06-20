// src/features/students/services/student.service.ts

import { AxiosError } from "axios";

import { apiClient } from "@/src/core/api/axios";

import {
  CreateStudentRequest,
  Student,
  StudentFilters,
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";

import {
  CreateStudentResponse,
  DeleteStudentResponse,
  GetStudentResponse,
  GetStudentsResponse,
  PermanentDeleteStudentResponse,
  UpdateStudentResponse,
} from "@/src/features/students/types/student.dto";

class StudentService {
  async getStudents(
    filters: StudentFilters
  ): Promise<GetStudentsResponse> {
    try {
      const { data } =
        await apiClient.get<GetStudentsResponse>(
          "/admin/students",
          {
            params: filters,
          }
        );

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStudent(
    id: string
  ): Promise<GetStudentResponse> {
    try {
      const { data } =
        await apiClient.get<GetStudentResponse>(
          `/admin/students/${id}`
        );

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createStudent(
    payload: CreateStudentRequest
  ): Promise<CreateStudentResponse> {
    try {
      const { data } =
        await apiClient.post<CreateStudentResponse>(
          "/admin/students",
          payload
        );

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStudent(
    id: string,
    payload: UpdateStudentRequest
  ): Promise<UpdateStudentResponse> {
    try {
      const { data } =
        await apiClient.patch<UpdateStudentResponse>(
          `/admin/students/${id}`,
          payload
        );

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async activateStudent(
    id: string
  ): Promise<GetStudentResponse> {
    try {
      const { data } =
        await apiClient.patch<GetStudentResponse>(
          `/admin/students/${id}/activate`
        );

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deactivateStudent(
    id: string
  ): Promise<GetStudentResponse> {
    try {
      const { data } =
        await apiClient.patch<GetStudentResponse>(
          `/admin/students/${id}/deactivate`
        );

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreStudent(
    id: string
  ): Promise<GetStudentResponse> {
    try {
      const { data } =
        await apiClient.patch<GetStudentResponse>(
          `/admin/students/${id}/restore`
        );

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteStudent(
    id: string
  ): Promise<DeleteStudentResponse> {
    try {
      const { data } =
        await apiClient.delete<DeleteStudentResponse>(
          `/admin/students/${id}`
        );

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async permanentDeleteStudent(
    id: string
  ): Promise<PermanentDeleteStudentResponse> {
    try {
      const { data } =
        await apiClient.delete<PermanentDeleteStudentResponse>(
          `/admin/students/${id}/permanent`
        );

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(
    error: unknown
  ): Error {
    if (error instanceof AxiosError) {
      return new Error(
        error.response?.data?.message ??
          error.message
      );
    }

    return new Error(
      "Unexpected error occurred."
    );
  }
}

export const studentService =
  new StudentService();