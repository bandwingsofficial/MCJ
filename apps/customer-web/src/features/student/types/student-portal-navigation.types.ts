import type { StudentPortalAccess } from "@/src/features/student-portal/types/student-portal.types";
import { resolveCustomerStudentAccess } from "@/src/features/student/services/student-access";
import type { StudentProfile } from "@/src/features/student/types";

export interface StudentPortalNavigationState {
  isLoading: boolean;
  error: string | null;
  resolvedPathname: string | null;
  studentProfile: StudentProfile | null;
  hasStudentRecord: boolean;
  studentStatus: string | null;
  jobStatus: string | null;
  portalAccess: StudentPortalAccess | null;
  hasValidEnrollment: boolean;
  canAccessLearning: boolean;
  showProfile: boolean;
  showMyApplications: boolean;
  showMyCourses: boolean;
}

export function buildStudentPortalNavigationState(input: {
  profile: StudentProfile | null;
  portalAccess: StudentPortalAccess | null;
  pathname?: string | null;
  error?: string | null;
}): StudentPortalNavigationState {
  const hasStudentRecord = Boolean(input.profile);
  const studentStatus = input.profile?.status ?? null;
  const jobStatus = input.profile?.jobStatus ?? null;
  const hasValidEnrollment = input.portalAccess?.allowed === true;
  const access = resolveCustomerStudentAccess({
    hasStudentRecord,
    studentStatus,
    hasValidEnrollment,
  });

  return {
    isLoading: false,
    error: input.error ?? null,
    resolvedPathname: input.pathname ?? null,
    studentProfile: input.profile,
    hasStudentRecord,
    studentStatus,
    jobStatus,
    portalAccess: input.portalAccess,
    hasValidEnrollment,
    canAccessLearning: access.showMyCourses,
    showProfile: access.showProfile,
    showMyApplications: access.showMyApplications,
    showMyCourses: access.showMyCourses,
  };
}

export const STUDENT_PORTAL_DEFAULT_NAVIGATION: StudentPortalNavigationState =
  {
    isLoading: true,
    error: null,
    resolvedPathname: null,
    studentProfile: null,
    hasStudentRecord: false,
    studentStatus: null,
    jobStatus: null,
    portalAccess: null,
    hasValidEnrollment: false,
    canAccessLearning: false,
    showProfile: true,
    showMyApplications: false,
    showMyCourses: false,
  };
