import { apiClient } from "@/src/core/api/axios";

import type {
  ApiResponse,
} from "@/src/core/types/api-response.types";

import type {
  StudentPortalAccess,
} from "@/src/features/student-portal/types/student-portal.types";

export const studentPortalApi =
  {
    /**
     * Checks whether the current
     * authenticated student is
     * allowed to access the
     * Student Portal.
     */
    getAccess() {
      return apiClient.get<
        ApiResponse<StudentPortalAccess>
      >(
        "/student-portal/access",
      );
    },
  };