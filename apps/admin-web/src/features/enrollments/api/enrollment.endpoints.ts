// src/features/enrollments/api/enrollment.endpoints.ts

export const ENROLLMENT_ENDPOINTS = {
  LIST: "/admin/enrollments",

  CREATE: "/admin/enrollments",

  DETAILS: (id: string) =>
    `/admin/enrollments/${id}`,

  UPDATE: (id: string) =>
    `/admin/enrollments/${id}`,

  UPDATE_STATUS: (id: string) =>
    `/admin/enrollments/${id}/status`,

  DELETE: (id: string) =>
    `/admin/enrollments/${id}`,

  RESTORE: (id: string) =>
    `/admin/enrollments/${id}/restore`,

  PERMANENT_DELETE: (id: string) =>
    `/admin/enrollments/${id}/permanent`,
};