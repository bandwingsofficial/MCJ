export type BranchRole =
  | "BRANCH_MANAGER"
  | "FACULTY"
  | "INTERVIEWER"
  | "STAFF"
  | "RECEPTIONIST"
  | "ACCOUNTANT"
  | "FACULTY_COORDINATOR"
  | "COUNSELOR";

export const ROLE_LABELS: Record<string, string> = {
  BRANCH_MANAGER: "Branch Manager",
  FACULTY: "Faculty",
  INTERVIEWER: "Interviewer",
  STAFF: "Staff",
  RECEPTIONIST: "Receptionist",
  ACCOUNTANT: "Accountant",
  FACULTY_COORDINATOR: "Faculty Coordinator",
  COUNSELOR: "Counselor",
};

const FACULTY_PREFIXES = [
  "/dashboard",
  "/batches",
  "/enrollments",
  "/attendance",
  "/assessments",
  "/students",
  "/forbidden",
];

const INTERVIEWER_PREFIXES = [
  "/dashboard",
  "/job-applications",
  "/interviews",
  "/placements",
  "/forbidden",
];

const MANAGER_PREFIXES = [
  "/dashboard",
  "/enrollments",
  "/batches",
  "/attendance",
  "/assessments",
  "/job-applications",
  "/interviews",
  "/placements",
  "/users",
  "/settings",
  "/students",
  "/forbidden",
];

const STAFF_PREFIXES = [
  "/dashboard",
  "/enrollments",
  "/batches",
  "/students",
  "/forbidden",
];

export function getAllowedPrefixes(role?: string | null): string[] {
  if (role === "FACULTY") return FACULTY_PREFIXES;
  if (role === "INTERVIEWER") return INTERVIEWER_PREFIXES;
  if (role === "BRANCH_MANAGER") return MANAGER_PREFIXES;
  return STAFF_PREFIXES;
}

export function isPathAllowed(
  role: string | null | undefined,
  pathname: string,
): boolean {
  if (role === "FACULTY" && /^\/batches\/(create|new)(\/|$)/.test(pathname)) {
    return false;
  }

  if (
    (role === "FACULTY" ||
      role === "BRANCH_MANAGER" ||
      role === "STAFF") &&
    /^\/students\/[^/]+$/.test(pathname)
  ) {
    return true;
  }

  return getAllowedPrefixes(role).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function formatRoleLabel(role?: string | null): string {
  if (!role) return "";
  return ROLE_LABELS[role] ?? role.replace(/_/g, " ");
}
