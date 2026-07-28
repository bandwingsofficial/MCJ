// src/features/enrollments/constants/defaults.ts

import {
  EnrollmentFilters,
  SortOrder,
} from "../types";

export const DEFAULT_PAGE = 1;

export const DEFAULT_LIMIT = 10;

export const DEFAULT_ENROLLMENT_FILTERS: EnrollmentFilters = {
  skip: 0,
  take: DEFAULT_LIMIT,
  search: "",

  sortBy: "createdAt",

  sortOrder: SortOrder.DESC,
};