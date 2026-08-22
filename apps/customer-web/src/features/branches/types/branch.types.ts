import type { ApiResponse } from "@/src/core/types/api-response.types";

export interface PublicBranch {
  id: string;
  branchName: string;
  branchCode: string;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string;
}

export interface GetBranchesResponse {
  success: boolean;
  message: string;
  data: PublicBranch[];
  meta?: {
    total: number;
    skip: number;
    take: number;
  };
}

export type GetBranchResponse = ApiResponse<
  PublicBranch & { description?: string | null }
>;
