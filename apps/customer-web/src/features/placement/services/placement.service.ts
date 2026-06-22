import { placementApi } from "@/src/features/placement/api/placement.api";

class PlacementService {
  async getPlacement() {
    const response =
      await placementApi.getPlacement();

    return response.data.data;
  }
}

export const placementService =
  new PlacementService();