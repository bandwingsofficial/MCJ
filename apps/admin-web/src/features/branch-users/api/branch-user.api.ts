// src/features/branch-users/api/branch-user.api.ts

export const branchUserApi = {
  all: ["branch-users"] as const,

  list: (includeDeleted: boolean) =>
    [
      ...branchUserApi.all,
      "list",
      includeDeleted,
    ] as const,

  detail: (id: string) =>
    [
      ...branchUserApi.all,
      "detail",
      id,
    ] as const,
};