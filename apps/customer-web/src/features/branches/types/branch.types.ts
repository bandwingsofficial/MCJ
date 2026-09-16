import type { ApiResponse } from "@/src/core/types/api-response.types";

export interface PublicBranch {
  id: string;
  branchName: string;
  branchCode: string;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  status: string;
  thumbnailUrl?: string | null;
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

export type GetBranchResponse = ApiResponse<PublicBranch>;
