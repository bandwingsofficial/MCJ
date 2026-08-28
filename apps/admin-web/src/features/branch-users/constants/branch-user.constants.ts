// src/features/branch-users/constants/branch-user.constants.ts

import type { BranchUserRole } from "@/src/features/branch-users/types/branch-user.types";

export const BRANCH_USER_ROLES: BranchUserRole[] = [
  "BRANCH_MANAGER",
  "RECEPTIONIST",
  "ACCOUNTANT",
  "FACULTY_COORDINATOR",
  "COUNSELOR",
  "STAFF",
  "FACULTY",
  "INTERVIEWER",
] as const;

export const SUPER_ADMIN_CREATABLE_ROLES = [
  "BRANCH_MANAGER",
] as const satisfies readonly BranchUserRole[];

export const BRANCH_USER_ROLE_OPTIONS = [
  {
    label: "Branch Manager",
    value: "BRANCH_MANAGER",
  },
  {
    label: "Receptionist",
    value: "RECEPTIONIST",
  },
  {
    label: "Accountant",
    value: "ACCOUNTANT",
  },
  {
    label: "Faculty Coordinator",
    value: "FACULTY_COORDINATOR",
  },
  {
    label: "Counselor",
    value: "COUNSELOR",
  },
  {
    label: "Staff",
    value: "STAFF",
  },
  {
    label: "Faculty",
    value: "FACULTY",
  },
  {
    label: "Interviewer",
    value: "INTERVIEWER",
  },
] as const;

export const SUPER_ADMIN_CREATABLE_ROLE_OPTIONS =
  BRANCH_USER_ROLE_OPTIONS.filter((option) =>
    SUPER_ADMIN_CREATABLE_ROLES.includes(
      option.value as (typeof SUPER_ADMIN_CREATABLE_ROLES)[number],
    ),
  );

export function getSuperAdminRoleFormOptions(
  currentRole?: BranchUserRole,
) {
  if (
    currentRole &&
    !SUPER_ADMIN_CREATABLE_ROLE_OPTIONS.some(
      (option) => option.value === currentRole,
    )
  ) {
    const existing = BRANCH_USER_ROLE_OPTIONS.find(
      (option) => option.value === currentRole,
    );
    return existing
      ? [...SUPER_ADMIN_CREATABLE_ROLE_OPTIONS, existing]
      : SUPER_ADMIN_CREATABLE_ROLE_OPTIONS;
  }

  return SUPER_ADMIN_CREATABLE_ROLE_OPTIONS;
}

export const BRANCH_USER_STATUS_OPTIONS = [
  {
    label: "All Status",
    value: "ALL",
  },
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Inactive",
    value: "INACTIVE",
  },
  {
    label: "Deleted",
    value: "DELETED",
  },
] as const;

export const BRANCH_USER_SEARCH_DEBOUNCE_MS = 500;

export const BRANCH_USER_DEFAULT_FILTERS = {
  search: "",
} as const;