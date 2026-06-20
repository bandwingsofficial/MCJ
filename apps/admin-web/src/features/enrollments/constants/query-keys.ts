// src/features/enrollments/constants/query-keys.ts

export const ENROLLMENT_QUERY_KEYS = {
  ALL: ["enrollments"] as const,

  LIST: (params?: unknown) =>
    [...ENROLLMENT_QUERY_KEYS.ALL, "list", params] as const,

  DETAIL: (id: string) =>
    [...ENROLLMENT_QUERY_KEYS.ALL, "detail", id] as const,

  CREATE: () =>
    [...ENROLLMENT_QUERY_KEYS.ALL, "create"] as const,

  UPDATE: () =>
    [...ENROLLMENT_QUERY_KEYS.ALL, "update"] as const,

  DELETE: () =>
    [...ENROLLMENT_QUERY_KEYS.ALL, "delete"] as const,

  RESTORE: () =>
    [...ENROLLMENT_QUERY_KEYS.ALL, "restore"] as const,

  STATUS: () =>
    [...ENROLLMENT_QUERY_KEYS.ALL, "status"] as const,
};