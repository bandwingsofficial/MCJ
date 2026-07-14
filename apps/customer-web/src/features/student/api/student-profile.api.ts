import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  CreateStudentProfileRequest,
  StudentProfile,
  UpdateStudentProfileRequest,
} from "@/src/features/student/types";

export const studentProfileApi = {
  getProfile() {
    return apiClient.get<
      ApiResponse<StudentProfile>
    >("/students/me");
  },

  createProfile(
    data: CreateStudentProfileRequest,
  ) {
    return apiClient.post<
      ApiResponse<StudentProfile>
    >(
      "/students/profile",
      data,
    );
  },

  updateProfile(
    data: UpdateStudentProfileRequest,
  ) {
    return apiClient.patch<
      ApiResponse<StudentProfile>
    >(
      "/students/me",
      data,
    );
  },
};