// src/features/courses/api/course.api.ts

export const courseApi = {
  all: ["courses"] as const,

  list: (
    includeDeleted: boolean
  ) =>
    [
      ...courseApi.all,
      "list",
      includeDeleted,
    ] as const,

  detail: (id: string) =>
    [
      ...courseApi.all,
      "detail",
      id,
    ] as const,
};