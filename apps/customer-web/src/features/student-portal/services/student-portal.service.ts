import { studentPortalApi } from "@/src/features/student-portal/api/student-portal.api";

import type {
  StudentPortalAccess,
} from "@/src/features/student-portal/types/student-portal.types";

class StudentPortalService {
  /**
   * Returns the current student's
   * portal access information.
   */
  async getAccess(): Promise<StudentPortalAccess> {
    const response =
      await studentPortalApi.getAccess();

    return response.data.data;
  }
}

export const studentPortalService =
  new StudentPortalService();