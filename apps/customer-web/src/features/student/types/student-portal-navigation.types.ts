import type { StudentPortalAccess } from "@/src/features/student-portal/types/student-portal.types";
import type { StudentProfile } from "@/src/features/student/types";

export interface StudentPortalNavigationState {
  isLoading: boolean;
  error: string | null;
  studentProfile: StudentProfile | null;
  hasStudentRecord: boolean;
  studentStatus: string | null;
  portalAccess: StudentPortalAccess | null;
  canAccessLearning: boolean;
  showProfile: boolean;
  showMyApplications: boolean;
  showMyCourses: boolean;
}

export function buildStudentPortalNavigationState(input: {
  profile: StudentProfile | null;
  portalAccess: StudentPortalAccess | null;
  error?: string | null;
}): StudentPortalNavigationState {
  const hasStudentRecord = Boolean(input.profile);
  const studentStatus = input.profile?.status ?? null;
  const canAccessLearning = input.portalAccess?.allowed === true;
  const isAdmittedStudent = studentStatus === "ADMITTED";

  return {
    isLoading: false,
    error: input.error ?? null,
    studentProfile: input.profile,
    hasStudentRecord,
    studentStatus,
    portalAccess: input.portalAccess,
    canAccessLearning,
    showProfile: true,
    showMyApplications: hasStudentRecord,
    showMyCourses:
      hasStudentRecord &&
      isAdmittedStudent &&
      canAccessLearning,
  };
}

export const STUDENT_PORTAL_DEFAULT_NAVIGATION: StudentPortalNavigationState =
  {
    isLoading: true,
    error: null,
    studentProfile: null,
    hasStudentRecord: false,
    studentStatus: null,
    portalAccess: null,
    canAccessLearning: false,
    showProfile: true,
    showMyApplications: false,
    showMyCourses: false,
  };
