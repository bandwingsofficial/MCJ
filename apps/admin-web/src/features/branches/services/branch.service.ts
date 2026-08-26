import { AxiosError } from "axios";

import { branchApi } from "@/src/features/branches/api/branch.api";

import {
  BranchFilters,
  CreateBranchRequest,
  UpdateBranchRequest,
  UpdateBranchStatusRequest,
} from "@/src/features/branches/types/branch.types";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

class BranchService {
  async getBranches(filters?: BranchFilters) {
    try {
      return await branchApi.getBranches(filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBranch(id: string) {
    try {
      return await branchApi.getBranch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async suggestBranchCode(branchName?: string) {
    try {
      return await branchApi.suggestBranchCode(branchName);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkAvailability(params: {
    branchCode?: string;
    branchName?: string;
    excludeId?: string;
  }) {
    try {
      return await branchApi.checkAvailability(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBranch(payload: CreateBranchRequest) {
    try {
      return await branchApi.createBranch(payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBranch(
    id: string,
    payload: UpdateBranchRequest
  ) {
    try {
      return await branchApi.updateBranch(id, payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStatus(
    id: string,
    payload: UpdateBranchStatusRequest
  ) {
    try {
      return await branchApi.updateStatus(id, payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBranch(id: string) {
    try {
      return await branchApi.deleteBranch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async permanentDeleteBranch(id: string) {
    try {
      return await branchApi.permanentDeleteBranch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBranchSummary(id: string) {
    try {
      return await branchApi.getBranchSummary(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignCategories(
    branchId: string,
    categoryIds: string[]
  ) {
    try {
      return await branchApi.assignCategories(
        branchId,
        categoryIds
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async unassignCategory(
    branchId: string,
    categoryId: string
  ) {
    try {
      return await branchApi.unassignCategory(
        branchId,
        categoryId
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignCourses(
    branchId: string,
    courseIds: string[]
  ) {
    try {
      return await branchApi.assignCourses(
        branchId,
        courseIds
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async unassignCourse(
    branchId: string,
    courseId: string
  ) {
    try {
      return await branchApi.unassignCourse(
        branchId,
        courseId
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreBranch(id: string) {
    try {
      return await branchApi.restoreBranch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reorderBranches(payload: {
    branchId: string;
    newDisplayOrder: number;
  }) {
    try {
      return await branchApi.reorderBranches(payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkUpdateStatus(
    branchIds: string[],
    status: "ACTIVE" | "INACTIVE"
  ) {
    try {
      return await branchApi.bulkUpdateStatus(
        branchIds,
        status
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDeleteBranches(branchIds: string[]) {
    try {
      return await branchApi.bulkDeleteBranches(branchIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkRestoreBranches(branchIds: string[]) {
    try {
      return await branchApi.bulkRestoreBranches(branchIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkPermanentDeleteBranches(branchIds: string[]) {
    try {
      return await branchApi.bulkPermanentDeleteBranches(
        branchIds
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      return new Error(getErrorMessage(error));
    }

    return new Error(
      error instanceof Error
        ? error.message
        : "Unexpected error occurred"
    );
  }
}

export const branchService = new BranchService();
