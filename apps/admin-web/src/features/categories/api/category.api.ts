export const categoryApi = {
  all: ["categories"] as const,

  list: (filters: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) =>
    [
      ...categoryApi.all,
      "list",
      filters.search ?? "",
      filters.status ?? "ALL",
      filters.page ?? 1,
      filters.pageSize ?? 20,
    ] as const,

  detail: (id: string) =>
    [
      ...categoryApi.all,
      "detail",
      id,
    ] as const,
};
