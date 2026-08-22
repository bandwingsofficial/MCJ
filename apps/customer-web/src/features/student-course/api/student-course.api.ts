import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type { StudentCoursePayloadDto } from "@/src/features/student-course/types/api.types";

export const studentCourseApi = {
  getCourse(courseId: string) {
    return apiClient.get<ApiResponse<StudentCoursePayloadDto>>(
      `/student/courses/${courseId}`,
    );
  },
};
