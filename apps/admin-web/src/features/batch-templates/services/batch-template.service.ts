import { apiClient } from "@/src/core/api/axios";

import type {
  ApiSuccessResponse,
  BatchTemplate,
  BulkBatchTemplateResult,
  CreateBatchTemplateRequest,
  CreateBatchesFromTemplatesRequest,
  CreateBatchesFromTemplatesResult,
  UpdateBatchTemplateRequest,
} from "@/src/features/batch-templates/types/batch-template.types";

export type BatchTemplateListFilters = {
  search?: string;
  mode?: "ONLINE" | "OFFLINE" | "RECORDED";
  isActive?: boolean;
  isDeleted?: boolean;
  /** When true, All Status includes archived rows (Categories-style). */
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
};

export type BatchTemplateListResult = {
  items: BatchTemplate[];
  total: number;
  catalogTotal: number;
};

type ListApiResponse = ApiSuccessResponse<BatchTemplate[]> & {
  meta?: {
    total?: number;
    catalogTotal?: number;
  };
};

class BatchTemplateService {
  private readonly basePath = "/admin/batch-templates";

  /** Returns items only — used by Assign Batches (unchanged contract). */
  async listTemplates(params?: {
    isActive?: boolean;
  }): Promise<BatchTemplate[]> {
    const result = await this.listTemplatesPage({
      isActive: params?.isActive,
      isDeleted: false,
      page: 1,
      pageSize: 200,
    });
    return result.items.filter((item) => !item.isDeleted);
  }

  async listTemplatesPage(
    filters: BatchTemplateListFilters = {},
  ): Promise<BatchTemplateListResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const response = await apiClient.get<ListApiResponse>(this.basePath, {
      params: {
        search: filters.search?.trim() || undefined,
        mode: filters.mode,
        isActive: filters.isActive,
        isDeleted: filters.isDeleted,
        includeDeleted: filters.includeDeleted,
        skip,
        take: pageSize,
      },
    });

    const items = (response.data.data ?? []).map((item) => ({
      ...item,
      isDeleted: Boolean(item.isDeleted),
    }));
    return {
      items,
      total: response.data.meta?.total ?? items.length,
      catalogTotal: response.data.meta?.catalogTotal ?? items.length,
    };
  }

  async createTemplate(
    payload: CreateBatchTemplateRequest,
  ): Promise<BatchTemplate> {
    const response = await apiClient.post<
      ApiSuccessResponse<BatchTemplate>
    >(this.basePath, payload);
    return response.data.data;
  }

  async updateTemplate(
    id: string,
    payload: UpdateBatchTemplateRequest,
  ): Promise<BatchTemplate> {
    const response = await apiClient.patch<
      ApiSuccessResponse<BatchTemplate>
    >(`${this.basePath}/${id}`, payload);
    return response.data.data;
  }

  async activateTemplate(id: string): Promise<BatchTemplate> {
    const response = await apiClient.post<
      ApiSuccessResponse<BatchTemplate>
    >(`${this.basePath}/${id}/enable`);
    return response.data.data;
  }

  async deactivateTemplate(id: string): Promise<BatchTemplate> {
    const response = await apiClient.post<
      ApiSuccessResponse<BatchTemplate>
    >(`${this.basePath}/${id}/disable`);
    return response.data.data;
  }

  /** Soft-archive (same endpoint Categories uses for archive). */
  async archiveTemplate(id: string): Promise<BatchTemplate> {
    const response = await apiClient.delete<
      ApiSuccessResponse<BatchTemplate>
    >(`${this.basePath}/${id}`);
    return response.data.data;
  }

  async restoreTemplate(id: string): Promise<BatchTemplate> {
    const response = await apiClient.patch<
      ApiSuccessResponse<BatchTemplate>
    >(`${this.basePath}/${id}/restore`);
    return response.data.data;
  }

  async permanentlyDeleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}/permanent`);
  }

  async bulkActivate(ids: string[]) {
    const response = await apiClient.post<
      ApiSuccessResponse<BulkBatchTemplateResult>
    >(`${this.basePath}/bulk/activate`, { ids });
    return response.data;
  }

  async bulkDeactivate(ids: string[]) {
    const response = await apiClient.post<
      ApiSuccessResponse<BulkBatchTemplateResult>
    >(`${this.basePath}/bulk/deactivate`, { ids });
    return response.data;
  }

  async bulkArchive(ids: string[]) {
    const response = await apiClient.post<
      ApiSuccessResponse<BulkBatchTemplateResult>
    >(`${this.basePath}/bulk/archive`, { ids });
    return response.data;
  }

  async bulkRestore(ids: string[]) {
    const response = await apiClient.post<
      ApiSuccessResponse<BulkBatchTemplateResult>
    >(`${this.basePath}/bulk/restore`, { ids });
    return response.data;
  }

  async bulkPermanentDelete(ids: string[]) {
    const response = await apiClient.post<
      ApiSuccessResponse<BulkBatchTemplateResult>
    >(`${this.basePath}/bulk/permanent-delete`, { ids });
    return response.data;
  }

  async createBatchesFromTemplates(
    payload: CreateBatchesFromTemplatesRequest,
  ): Promise<ApiSuccessResponse<CreateBatchesFromTemplatesResult>> {
    const response = await apiClient.post<
      ApiSuccessResponse<CreateBatchesFromTemplatesResult>
    >(`${this.basePath}/create-batches`, payload);
    return response.data;
  }
}

export const batchTemplateService = new BatchTemplateService();
