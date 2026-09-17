import { branchApi } from "@/src/features/branches/api/branch.api";
import {
  syncBranchImageFields,
  syncBranchImageList,
} from "@/src/shared/utils/entity-image-sync.util";
import type { PublicBranch } from "@/src/features/branches/types/branch.types";

class BranchService {
  async getBranches(search?: string): Promise<PublicBranch[]> {
    const response = await branchApi.getBranches(search);
    return syncBranchImageList(response.data.data ?? []);
  }

  async getBranch(slugOrId: string): Promise<PublicBranch> {
    const response = await branchApi.getBranch(slugOrId);
    return syncBranchImageFields(response.data.data);
  }
}

export const branchService = new BranchService();
