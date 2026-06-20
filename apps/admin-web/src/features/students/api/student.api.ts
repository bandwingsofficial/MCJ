export const studentApi = {
  all: ["students"] as const,

  lists: () =>
    [...studentApi.all, "list"] as const,

  list: (filters: {
    search?: string;
    includeDeleted?: boolean;
    status?: string;
    gender?: string;
    branchId?: string;
  }) =>
    [
      ...studentApi.lists(),
      filters,
    ] as const,

  details: () =>
    [...studentApi.all, "detail"] as const,

  detail: (id: string) =>
    [
      ...studentApi.details(),
      id,
    ] as const,
};