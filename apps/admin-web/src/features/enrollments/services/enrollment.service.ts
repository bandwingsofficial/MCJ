// src/features/enrollments/services/enrollment.service.ts

import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { enrollmentApi } from "../api";

import {
  CreateEnrollmentRequest,
  EnrollmentFilters,
  UpdateEnrollmentRequest,
  UpdateEnrollmentStatusRequest,
} from "../types";

function wrapError(error: unknown): Error {
  return new Error(getErrorMessage(error));
}

export const enrollmentService = {
  async getEnrollments(
    filters: EnrollmentFilters,
  ) {
    try {
      const response =
        await enrollmentApi.getEnrollments(
          filters,
        );

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async getEnrollment(id: string) {
    try {
      const response =
        await enrollmentApi.getEnrollment(
          id,
        );

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async createEnrollment(
    payload: CreateEnrollmentRequest,
  ) {
    try {
      const response =
        await enrollmentApi.createEnrollment(
          payload,
        );

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async updateEnrollment(
    id: string,
    payload: UpdateEnrollmentRequest,
  ) {
    try {
      const response =
        await enrollmentApi.updateEnrollment(
          id,
          payload,
        );

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async updateStatus(
    id: string,
    payload: UpdateEnrollmentStatusRequest,
  ) {
    try {
      const response =
        await enrollmentApi.updateStatus(
          id,
          payload,
        );

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async approveEnrollment(id: string) {
    try {
      const response = await enrollmentApi.approveEnrollment(id);

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async rejectEnrollment(id: string, reason: string) {
    try {
      const response = await enrollmentApi.rejectEnrollment(id, reason);

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async unenrollEnrollment(id: string, reason?: string) {
    try {
      const response = await enrollmentApi.unenrollEnrollment(id, reason);

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async deleteEnrollment(
    id: string,
  ) {
    try {
      const response =
        await enrollmentApi.deleteEnrollment(
          id,
        );

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async restoreEnrollment(
    id: string,
  ) {
    try {
      const response =
        await enrollmentApi.restoreEnrollment(
          id,
        );

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async permanentDeleteEnrollment(
    id: string,
  ) {
    try {
      const response =
        await enrollmentApi.permanentDeleteEnrollment(
          id,
        );

      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },
};