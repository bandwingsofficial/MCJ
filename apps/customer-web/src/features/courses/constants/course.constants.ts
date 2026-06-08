export const COURSE_QUERY_KEYS = {
  all: ["courses"] as const,

  list: (
    search?: string,
    categoryId?: string,
    branchId?: string,
    isFeatured?: boolean
  ) =>
    [
      ...COURSE_QUERY_KEYS.all,
      search ?? "",
      categoryId ?? "",
      branchId ?? "",
      isFeatured ?? false,
    ] as const,

  detail: (slug: string) =>
    [
      ...COURSE_QUERY_KEYS.all,
      "detail",
      slug,
    ] as const,
};