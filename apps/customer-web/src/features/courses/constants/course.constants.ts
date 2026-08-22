export const COURSE_QUERY_KEYS = {
  all: ["courses"] as const,

  list: (
    search?: string,
    categoryId?: string,
    branchId?: string,
    isFeatured?: boolean,
    isPopular?: boolean,
  ) =>
    [
      ...COURSE_QUERY_KEYS.all,
      search ?? "",
      categoryId ?? "",
      branchId ?? "",
      isFeatured ?? false,
      isPopular ?? false,
    ] as const,

  detail: (identifier: string) =>
    [
      ...COURSE_QUERY_KEYS.all,
      "detail",
      identifier,
    ] as const,

  summary: (id: string) =>
    [...COURSE_QUERY_KEYS.all, "summary", id] as const,
};