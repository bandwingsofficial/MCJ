import type {
  Student,
  StudentFilters,
  StudentListResponse,
} from "@/src/features/students/types/student.types";
import {
  ACTIVE_STUDENTS_FILTER,
  ARCHIVED_STUDENTS_FILTER,
  DELETED_STUDENTS_FILTER,
} from "@/src/features/students/constants/student.constants";
import { STUDENT_SELECT_ALL } from "@/src/features/students/utils/student-select.utils";

export {
  ACTIVE_STUDENTS_FILTER,
  ARCHIVED_STUDENTS_FILTER,
  DELETED_STUDENTS_FILTER,
} from "@/src/features/students/constants/student.constants";

export type StudentStatusFilterValue =
  | Student["status"]
  | typeof ARCHIVED_STUDENTS_FILTER
  | typeof ACTIVE_STUDENTS_FILTER;

export function getStudentStatusFilterValue(
  filters: Pick<
    StudentFilters,
    "status" | "includeDeleted" | "onlyActive" | "includeAll"
  >,
): StudentStatusFilterValue | typeof STUDENT_SELECT_ALL {
  if (filters.includeDeleted) {
    return ARCHIVED_STUDENTS_FILTER;
  }

  if (filters.onlyActive) {
    return ACTIVE_STUDENTS_FILTER;
  }

  if (filters.status) {
    return filters.status;
  }

  return STUDENT_SELECT_ALL;
}

export function applyStudentStatusFilter(
  filters: StudentFilters,
  value: StudentStatusFilterValue | typeof STUDENT_SELECT_ALL,
): StudentFilters {
  if (value === STUDENT_SELECT_ALL) {
    return {
      ...filters,
      status: undefined,
      includeDeleted: false,
      includeAll: true,
      onlyActive: undefined,
      page: 1,
    };
  }

  if (value === ARCHIVED_STUDENTS_FILTER) {
    return {
      ...filters,
      status: undefined,
      includeDeleted: true,
      includeAll: false,
      onlyActive: undefined,
      page: 1,
    };
  }

  if (value === ACTIVE_STUDENTS_FILTER) {
    return {
      ...filters,
      status: undefined,
      includeDeleted: false,
      includeAll: false,
      onlyActive: true,
      page: 1,
    };
  }

  return {
    ...filters,
    status: value,
    includeDeleted: false,
    includeAll: false,
    onlyActive: undefined,
    page: 1,
  };
}

export function buildStudentListQueryParams(filters?: StudentFilters) {
  const page = filters?.page ?? 1;
  const pageSize = Math.min(filters?.pageSize ?? 20, 100);
  const skip = (page - 1) * pageSize;
  const includeDeleted = filters?.includeDeleted === true;

  return {
    search: filters?.search?.trim() || undefined,
    branchId: filters?.branchId || undefined,
    status: includeDeleted ? undefined : filters?.status || undefined,
    gender: filters?.gender || undefined,
    includeDeleted: includeDeleted ? true : undefined,
    includeAll: filters?.includeAll === true ? true : undefined,
    onlyActive: filters?.onlyActive === true ? true : undefined,
    skip,
    take: pageSize,
  };
}

export function parseStudentListResponse(data: unknown): StudentListResponse {
  if (Array.isArray(data)) {
    return {
      items: data as Student[],
      count: data.length,
    };
  }

  if (!data || typeof data !== "object") {
    return { items: [], count: 0 };
  }

  const record = data as Record<string, unknown>;
  const items = record.items;

  if (Array.isArray(items)) {
    const count =
      typeof record.count === "number" ? record.count : items.length;

    return {
      items: items as Student[],
      count,
    };
  }

  return { items: [], count: 0 };
}
