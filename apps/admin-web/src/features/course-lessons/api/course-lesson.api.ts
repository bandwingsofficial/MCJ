// src/features/course-lessons/api/course-lesson.api.ts

export const courseLessonApi = {
  all: [
    "course-lessons",
  ] as const,

  lists: () =>
    [
      ...courseLessonApi.all,
      "list",
    ] as const,

  detail: (
    id: string,
  ) =>
    [
      ...courseLessonApi.all,
      "detail",
      id,
    ] as const,
};