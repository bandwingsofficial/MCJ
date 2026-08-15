// src/features/branch-users/constants/branch-user.constants.ts

import type { BranchUserRole } from "@/src/features/branch-users/types/branch-user.types";

export const BRANCH_USER_ROLES: BranchUserRole[] = [
  "BRANCH_MANAGER",
  "RECEPTIONIST",
  "ACCOUNTANT",
  "FACULTY_COORDINATOR",
  "COUNSELOR",
  "STAFF",
] as const;

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
] as const;

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