// src/features/enrollments/api/enrollment.api.ts

import { apiClient } from "@/src/core/api/axios";

import {
  CreateEnrollmentRequest,
  EnrollmentFilters,
  EnrollmentListResponse,
  EnrollmentResponse,
  UpdateEnrollmentRequest,
  UpdateEnrollmentStatusRequest,
  DeleteEnrollmentResponse,
} from "../types";
import type { EnrollmentAttendanceResponse } from "../types/enrollment-attendance.types";
import type { EnrollmentAssessmentResponse } from "../types/enrollment-assessment.types";

import { ENROLLMENT_ENDPOINTS } from "./enrollment.endpoints";
import { buildEnrollmentQuery } from "./enrollment.helper";

export const enrollmentApi = {
  async getEnrollments(
    filters: EnrollmentFilters,
  ) {
    return apiClient.get<EnrollmentListResponse>(
      ENROLLMENT_ENDPOINTS.LIST,
      {
        params: buildEnrollmentQuery({
          ...filters,
          take: Math.min(filters.take ?? 10, 100),
        }),
      },
    );
  },

  async getEnrollment(id: string) {
    return apiClient.get<EnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.DETAILS(id),
    );
  },

  async getEnrollmentAttendance(
    id: string,
    params?: Record<string, string | undefined>,
  ) {
    return apiClient.get<EnrollmentAttendanceResponse>(
      ENROLLMENT_ENDPOINTS.ATTENDANCE(id),
      { params },
    );
  },

  async getEnrollmentAssessments(id: string) {
    return apiClient.get<EnrollmentAssessmentResponse>(
      ENROLLMENT_ENDPOINTS.ASSESSMENTS(id),
    );
  },

  async createEnrollment(
    payload: CreateEnrollmentRequest,
  ) {
    return apiClient.post<EnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.CREATE,
      payload,
    );
  },

  async updateEnrollment(
    id: string,
    payload: UpdateEnrollmentRequest,
  ) {
    return apiClient.patch<EnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.UPDATE(id),
      payload,
    );
  },

  async updateStatus(
    id: string,
    payload: UpdateEnrollmentStatusRequest,
  ) {
    return apiClient.patch<EnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.UPDATE_STATUS(id),
      payload,
    );
  },

  async approveEnrollment(id: string) {
    return apiClient.post<EnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.APPROVE(id),
    );
  },

  async rejectEnrollment(id: string, reason: string) {
    return apiClient.post<EnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.REJECT(id),
      { reason },
    );
  },

  async unenrollEnrollment(id: string, reason?: string) {
    return apiClient.post<EnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.UNENROLL(id),
      reason ? { reason } : {},
    );
  },

  async deleteEnrollment(id: string) {
    return apiClient.delete<DeleteEnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.DELETE(id),
    );
  },

  async restoreEnrollment(id: string) {
    return apiClient.patch<EnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.RESTORE(id),
    );
  },

  async permanentDeleteEnrollment(
    id: string,
  ) {
    return apiClient.delete<DeleteEnrollmentResponse>(
      ENROLLMENT_ENDPOINTS.PERMANENT_DELETE(id),
    );
  },
};