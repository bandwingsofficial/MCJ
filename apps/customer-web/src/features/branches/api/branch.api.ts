import { apiClient } from "@/src/core/api/axios";

import type {
  GetBranchResponse,
  GetBranchesResponse,
} from "@/src/features/branches/types/branch.types";

export const branchApi = {
  getBranches(search?: string) {
    return apiClient.get<GetBranchesResponse>("/branches", {
      params: { search },
    });
  },

  getBranch(slugOrId: string) {
    return apiClient.get<GetBranchResponse>(`/branches/${slugOrId}`);
  },
};
