import { AxiosError } from "axios";

import { studentProfileApi } from "@/src/features/student/api";

import type {
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

  async createProfile(
    payload: CreateStudentProfileRequest,
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
      const message =
        error.response?.data
          ?.message;

      if (
        typeof message ===
        "string"
      ) {
        return new Error(
          message,
        );
      }

      switch (
        error.response?.status
      ) {
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

        case 404:
          return new Error(
            "Student profile not found.",
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