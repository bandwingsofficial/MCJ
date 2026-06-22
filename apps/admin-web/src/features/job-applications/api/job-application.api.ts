export const jobApplicationApi = {
  all: [
    "job-applications",
  ] as const,

  lists: () =>
    [
      ...jobApplicationApi.all,
      "list",
    ] as const,

  detail: (
    id: string,
  ) =>
    [
      ...jobApplicationApi.all,
      "detail",
      id,
    ] as const,
};