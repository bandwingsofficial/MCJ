// src/features/categories/constants/category.constants.ts

export const CATEGORY_QUERY_KEYS = {
  all: ["categories"] as const,

  list: (
    search?: string,
    branchId?: string
  ) =>
    [
      ...CATEGORY_QUERY_KEYS.all,
      search ?? "",
      branchId ?? "",
    ] as const,
};