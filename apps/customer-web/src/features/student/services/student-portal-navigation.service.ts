import { AxiosError } from "axios";

import { studentPortalService } from "@/src/features/student-portal/services/student-portal.service";
import { isAdmittedStudentStatus } from "@/src/features/student/services/student-access";
import { studentProfileService } from "@/src/features/student/services";

import type { StudentPortalAccess } from "@/src/features/student-portal/types/student-portal.types";
import {
  buildStudentPortalNavigationState,
  type StudentPortalNavigationState,
} from "@/src/features/student/types/student-portal-navigation.types";

async function loadPortalAccess(): Promise<StudentPortalAccess | null> {
  try {
    return await studentPortalService.getAccess();
  } catch (error) {
    if (error instanceof AxiosError) {
      const meta = error.response?.data?.meta as
        | { allowed?: boolean }
        | undefined;

      if (meta?.allowed === false) {
        return null;
      }

      const status = error.response?.status;

      if (status === 403 || status === 404) {
        return null;
      }
    }

    throw error;
  }
}

export async function resolveStudentPortalNavigation(): Promise<StudentPortalNavigationState> {
  const profile = await studentProfileService.getProfileOrNull();

  const portalAccess = isAdmittedStudentStatus(profile?.status)
    ? await loadPortalAccess()
    : null;

  return buildStudentPortalNavigationState({
    profile,
    portalAccess,
  });
}
