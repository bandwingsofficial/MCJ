export const categoryApi = {
  all: ["categories"] as const,

  list: (
    includeDeleted: boolean
  ) =>
    [
      ...categoryApi.all,
      "list",
      includeDeleted,
    ] as const,

  detail: (id: string) =>
    [
      ...categoryApi.all,
      "detail",
      id,
    ] as const,
};