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

  uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "students");
    formData.append("fileName", file.name);

    return apiClient.post<
      ApiResponse<{ fileId?: string; id?: string }>
    >("/students/me/uploads", formData, {
      headers: {
        "Content-Type": undefined,
      },
      transformRequest: [(data) => data],
    });
  },
};