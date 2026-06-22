import { apiClient } from "@/src/core/api/axios";

import type {
  PlacementListResponse,
  PlacementResponse,
  UpdatePlacementRequest,
  UpdatePlacementResponse,
} from "@/src/features/placements/types/placement.types";

class PlacementService {
  async getPlacements() {
    const { data } =
      await apiClient.get<PlacementListResponse>(
        "/admin/placements",
      );

    return data;
  }

  async getPlacement(id: string) {
    const { data } =
      await apiClient.get<PlacementResponse>(
        `/admin/placements/${id}`,
      );

    return data;
  }

  async updatePlacement(
    id: string,
    payload: UpdatePlacementRequest,
  ) {
    const { data } =
      await apiClient.patch<UpdatePlacementResponse>(
        `/admin/placements/${id}`,
        payload,
      );

    return data;
  }
}

export const placementService =
  new PlacementService();