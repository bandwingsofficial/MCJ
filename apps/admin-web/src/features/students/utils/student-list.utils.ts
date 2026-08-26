import type {
  Student,
  StudentFilters,
  StudentListResponse,
} from "@/src/features/students/types/student.types";
import { STUDENT_SELECT_ALL } from "@/src/features/students/utils/student-select.utils";

export const DELETED_STUDENTS_FILTER = "DELETED" as const;

export type StudentStatusFilterValue =
  | Student["status"]
  | typeof DELETED_STUDENTS_FILTER;

export function getStudentStatusFilterValue(
  filters: Pick<StudentFilters, "status" | "includeDeleted">,
): StudentStatusFilterValue | typeof STUDENT_SELECT_ALL {
  if (filters.includeDeleted) {
    return DELETED_STUDENTS_FILTER;
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
    };
  }

  if (value === DELETED_STUDENTS_FILTER) {
    return {
      ...filters,
      status: undefined,
      includeDeleted: true,
    };
  }

  return {
    ...filters,
    status: value,
    includeDeleted: false,
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
