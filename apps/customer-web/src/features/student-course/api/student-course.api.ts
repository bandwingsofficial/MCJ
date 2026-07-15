import { apiClient } from "@/src/core/api/axios";

import type {
  ApiResponse,
} from "@/src/core/types/api-response.types";

import type {
  StudentCourseResponseDto,
} from "@/src/features/student-course/types/api.types";

export const studentCourseApi = {
  /**
   * Fetches a student's enrolled course.
   */
  getCourse(
    courseId: string,
  ) {
    return apiClient.get<
      ApiResponse<StudentCourseResponseDto>
    >(
      `/student/courses/${courseId}`,
    );
  },
};