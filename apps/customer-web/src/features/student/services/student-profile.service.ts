import { AxiosError } from "axios";

import { studentProfileApi } from "@/src/features/student/api";
import {
  isStudentNotFoundError,
  StudentNotFoundError,
} from "@/src/features/student/errors/student-not-found.error";

import type {
  CreateStudentProfilePayload,
  CreateStudentProfileRequest,
  StudentProfile,
  UpdateStudentProfileRequest,
} from "@/src/features/student/types";

class StudentProfileService {
  async getProfile(): Promise<StudentProfile> {
    try {
      const response =
        await studentProfileApi.getProfile();

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProfileOrNull(): Promise<StudentProfile | null> {
    try {
      return await this.getProfile();
    } catch (error) {
      if (isStudentNotFoundError(error)) {
        return null;
      }

      throw error;
    }
  }

  async createProfile(
    payload: CreateStudentProfilePayload | CreateStudentProfileRequest,
  ): Promise<StudentProfile> {
    try {
      const response =
        await studentProfileApi.createProfile(
          payload,
        );

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(
    payload: UpdateStudentProfileRequest,
  ): Promise<StudentProfile> {
    try {
      const response =
        await studentProfileApi.updateProfile(
          payload,
        );

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(
    error: unknown,
  ): Error {
    if (
      error instanceof AxiosError
    ) {
      const status =
        error.response?.status;

      const message =
        error.response?.data
          ?.message;

      if (status === 404) {
        return new StudentNotFoundError(
          typeof message === "string"
            ? message
            : undefined,
        );
      }

      if (
        typeof message ===
        "string"
      ) {
        return new Error(
          message,
        );
      }

      switch (status) {
        case 400:
          return new Error(
            "Invalid request.",
          );

        case 401:
          return new Error(
            "Please login again.",
          );

        case 403:
          return new Error(
            "You are not authorized to perform this action.",
          );

        case 409:
          return new Error(
            "Student profile already exists.",
          );

        case 422:
          return new Error(
            "Validation failed.",
          );

        case 500:
          return new Error(
            "Server error. Please try again later.",
          );

        default:
          return new Error(
            "Something went wrong.",
          );
      }
    }

    if (
      error instanceof Error
    ) {
      return error;
    }

    return new Error(
      "Unknown error occurred.",
    );
  }
}

export const studentProfileService =
  new StudentProfileService();