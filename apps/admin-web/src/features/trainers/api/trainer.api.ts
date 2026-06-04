export const trainerApi = {
  all: ["trainers"] as const,

  list: (
    includeDeleted: boolean
  ) =>
    [
      ...trainerApi.all,
      "list",
      includeDeleted,
    ] as const,

  detail: (id: string) =>
    [
      ...trainerApi.all,
      "detail",
      id,
    ] as const,
};