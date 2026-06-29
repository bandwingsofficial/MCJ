// src/features/community/api/community.api.ts

export const communityApi = {
  all: ["community-posts"] as const,

  lists: () =>
    [...communityApi.all, "list"] as const,

  list: (
    search?: string,
    status?: string,
    type?: string,
    includeDeleted?: boolean,
  ) =>
    [
      ...communityApi.lists(),
      {
        search,
        status,
        type,
        includeDeleted,
      },
    ] as const,

  details: () =>
    [...communityApi.all, "detail"] as const,

  detail: (id: string) =>
    [...communityApi.details(), id] as const,

  comments: (postId: string) =>
    [...communityApi.detail(postId), "comments"] as const,
};