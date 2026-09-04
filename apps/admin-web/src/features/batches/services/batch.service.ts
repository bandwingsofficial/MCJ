import { AxiosError } from "axios";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { batchApi } from "@/src/features/batches/api/batch.api";
import { branchService } from "@/src/features/branches/services/branch.service";
import { categoryService } from "@/src/features/categories/services/category.service";
import { courseService } from "@/src/features/courses/services/course.service";
import { trainerService } from "@/src/features/trainers/services/trainer.service";

import type {
  TrainerListItem,
} from "@/src/features/trainers/types/trainer.types";

import type {
  AssignBatchTrainersRequest,
  AssignBatchCourseRequest,
  Batch,
  BatchCourseAssignment,
  BatchFilters,
  BatchSummary,
  BulkBatchOperationResult,
  CourseOption,
  CategoryOption,
  BranchOption,
  CreateBatchRequest,
  ReorderBatchRequest,
  UpdateBatchRequest,
} from "@/src/features/batches/types/batch.types";

const FORM_OPTIONS_PAGE_SIZE = 100;

class BatchService {
  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      return new Error(getErrorMessage(error));
    }

    return new Error(
      error instanceof Error ? error.message : "Unexpected error occurred",
    );
  }

  async getBatches(filters?: BatchFilters) {
    try {
      return await batchApi.getBatches(filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBatch(id: string) {
    try {
      return await batchApi.getBatch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBatchSummary(id: string) {
    try {
      return await batchApi.getBatchSummary(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async suggestBatchCode(startDate: string) {
    try {
      return await batchApi.suggestBatchCode(startDate);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBatch(payload: CreateBatchRequest) {
    try {
      return await batchApi.createBatch(payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBatch(id: string, payload: UpdateBatchRequest) {
    try {
      return await batchApi.updateBatch(id, payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignTrainers(id: string, payload: AssignBatchTrainersRequest) {
    try {
      return await batchApi.assignTrainers(id, payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async activateBatch(id: string) {
    try {
      return await batchApi.activateBatch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deactivateBatch(id: string) {
    try {
      return await batchApi.deactivateBatch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreBatch(id: string) {
    try {
      return await batchApi.restoreBatch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBatch(id: string) {
    try {
      return await batchApi.deleteBatch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async permanentlyDeleteBatch(id: string) {
    try {
      return await batchApi.permanentlyDeleteBatch(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reorderBatches(payload: ReorderBatchRequest) {
    try {
      return await batchApi.reorderBatches(payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkActivate(batchIds: string[]) {
    try {
      return await batchApi.bulkActivate(batchIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDeactivate(batchIds: string[]) {
    try {
      return await batchApi.bulkDeactivate(batchIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDelete(batchIds: string[]) {
    try {
      return await batchApi.bulkDelete(batchIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkRestore(batchIds: string[]) {
    try {
      return await batchApi.bulkRestore(batchIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkPermanentDelete(batchIds: string[]) {
    try {
      return await batchApi.bulkPermanentDelete(batchIds);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBatchCourses(batchId: string): Promise<BatchCourseAssignment[]> {
    try {
      const response = await batchApi.getBatchCourses(batchId);
      return response.data ?? [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignBatchCourse(
    batchId: string,
    payload: AssignBatchCourseRequest,
  ): Promise<BatchCourseAssignment> {
    try {
      const response = await batchApi.assignBatchCourse(batchId, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeBatchCourse(
    batchId: string,
    assignmentId: string,
  ): Promise<void> {
    try {
      await batchApi.removeBatchCourse(batchId, assignmentId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCategories(): Promise<CategoryOption[]> {
    try {
      const response = await categoryService.getCategories({
        search: "",
        status: "ACTIVE",
        page: 1,
        pageSize: FORM_OPTIONS_PAGE_SIZE,
      });

      return (response.data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCourses(): Promise<CourseOption[]> {
    try {
      const response = await courseService.getCourses({
        page: 1,
        pageSize: FORM_OPTIONS_PAGE_SIZE,
        status: "ACTIVE",
      });

      return (response.data.items ?? []).map((course) => ({
        id: course.id,
        title: course.title,
        code: course.code,
        category: course.category
          ? { id: course.category.id, name: course.category.name }
          : course.categoryId && course.categoryName
            ? { id: course.categoryId, name: course.categoryName }
            : null,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBranches(): Promise<BranchOption[]> {
    try {
      const response = await branchService.getBranches({
        status: "ACTIVE",
        page: 1,
        pageSize: FORM_OPTIONS_PAGE_SIZE,
        includeDeleted: false,
      });

      return (response.data.items ?? []).map((branch) => ({
        id: branch.id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getActiveTrainers(): Promise<TrainerListItem[]> {
    try {
      const response = await trainerService.getTrainers({
        status: "ACTIVE",
        page: 1,
        pageSize: FORM_OPTIONS_PAGE_SIZE,
      });

      return (response.data.items ?? []).filter(
        (trainer) => trainer.status === "ACTIVE" && !trainer.deletedAt,
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const batchService = new BatchService();
