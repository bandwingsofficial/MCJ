import { AxiosError } from "axios";

import { branchApi } from "@/src/features/branches/api/branch.api";

import {
  BranchFilters,
  CreateBranchRequest,
  UpdateBranchRequest,
  UpdateBranchStatusRequest,
} from "@/src/features/branches/types/branch.types";

class BranchService {
  async getBranches(
    filters?: BranchFilters
  ) {
    try {
      return await branchApi.getBranches(
        filters
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBranch(id: string) {
    try {
      return await branchApi.getBranch(
        id
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBranch(
    payload: CreateBranchRequest
  ) {
    try {
      return await branchApi.createBranch(
        payload
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBranch(
    id: string,
    payload: UpdateBranchRequest
  ) {
    try {
      return await branchApi.updateBranch(
        id,
        payload
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStatus(
    id: string,
    payload:
      UpdateBranchStatusRequest
  ) {
    try {
      return await branchApi.updateStatus(
        id,
        payload
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBranch(
    id: string
  ) {
    try {
      return await branchApi.deleteBranch(
        id
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

   async permanentlyDeleteBranch(
    id: string
  ) {
    try {
      return await branchApi.deletePermanentlyBranch(
        id
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreBranch(
    id: string
  ) {
    try {
      return await branchApi.restoreBranch(
        id
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(
    error: unknown
  ): Error {
    if (
      error instanceof AxiosError
    ) {
      const message =
        error.response?.data
          ?.message ??
        "Something went wrong";

      return new Error(message);
    }

    return new Error(
      "Unexpected error occurred"
    );
  }
}

export const branchService =
  new BranchService();