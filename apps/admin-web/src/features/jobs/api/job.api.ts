export const jobApi = {
  all: ["jobs"] as const,

  lists: () =>
    [...jobApi.all, "list"] as const,

  detail: (id: string) =>
    [...jobApi.all, "detail", id] as const,
};