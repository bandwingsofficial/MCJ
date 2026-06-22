import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  Placement,
} from "@/src/features/placement/types/placement.types";

export const placementApi = {
  getPlacement() {
    return apiClient.get<
      ApiResponse<Placement>
    >("/my-placement");
  },
};