// src/features/enrollments/services/enrollment.service.ts

import { enrollmentApi } from "../api";

import {
  CreateEnrollmentRequest,
  EnrollmentFilters,
  UpdateEnrollmentRequest,
  UpdateEnrollmentStatusRequest,
} from "../types";

export const enrollmentService = {
  async getEnrollments(
    filters: EnrollmentFilters,
  ) {
    const response =
      await enrollmentApi.getEnrollments(
        filters,
      );

    return response.data;
  },

  async getEnrollment(id: string) {
    const response =
      await enrollmentApi.getEnrollment(
        id,
      );

    return response.data;
  },

  async createEnrollment(
    payload: CreateEnrollmentRequest,
  ) {
    const response =
      await enrollmentApi.createEnrollment(
        payload,
      );

    return response.data;
  },

  async updateEnrollment(
    id: string,
    payload: UpdateEnrollmentRequest,
  ) {
    const response =
      await enrollmentApi.updateEnrollment(
        id,
        payload,
      );

    return response.data;
  },

  async updateStatus(
    id: string,
    payload: UpdateEnrollmentStatusRequest,
  ) {
    const response =
      await enrollmentApi.updateStatus(
        id,
        payload,
      );

    return response.data;
  },

  async deleteEnrollment(
    id: string,
  ) {
    const response =
      await enrollmentApi.deleteEnrollment(
        id,
      );

    return response.data;
  },

  async restoreEnrollment(
    id: string,
  ) {
    const response =
      await enrollmentApi.restoreEnrollment(
        id,
      );

    return response.data;
  },

  async permanentDeleteEnrollment(
    id: string,
  ) {
    const response =
      await enrollmentApi.permanentDeleteEnrollment(
        id,
      );

    return response.data;
  },
};