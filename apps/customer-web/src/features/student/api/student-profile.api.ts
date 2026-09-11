import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  CreateStudentProfilePayload,
  CreateStudentProfileRequest,
  StudentProfile,
  UpdateStudentProfileRequest,
} from "@/src/features/student/types";

export const studentProfileApi = {
  getProfile() {
    return apiClient.get<
      ApiResponse<StudentProfile | null>
    >("/students/me");
  },

  createProfile(
    data: CreateStudentProfilePayload | CreateStudentProfileRequest,
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