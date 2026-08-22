import { branchApi } from "@/src/features/branches/api/branch.api";
import type { PublicBranch } from "@/src/features/branches/types/branch.types";

class BranchService {
  async getBranches(search?: string): Promise<PublicBranch[]> {
    const response = await branchApi.getBranches(search);
    return response.data.data ?? [];
  }

  async getBranch(id: string): Promise<PublicBranch> {
    const response = await branchApi.getBranch(id);
    return response.data.data;
  }
}

export const branchService = new BranchService();
