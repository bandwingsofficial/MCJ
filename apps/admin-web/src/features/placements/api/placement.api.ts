export const placementApi = {
  all: ["placements"] as const,

  lists: () =>
    [...placementApi.all, "list"] as const,

  detail: (id: string) =>
    [
      ...placementApi.all,
      "detail",
      id,
    ] as const,
};