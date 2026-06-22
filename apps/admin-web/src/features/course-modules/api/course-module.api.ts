export const courseModuleApi = {
  all: [
    "course-modules",
  ] as const,

  list: (
    courseId: string,
    includeDeleted: boolean
  ) =>
    [
      ...courseModuleApi.all,
      "list",
      courseId,
      includeDeleted,
    ] as const,

  detail: (
    moduleId: string
  ) =>
    [
      ...courseModuleApi.all,
      "detail",
      moduleId,
    ] as const,
};