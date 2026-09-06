import { apiClient } from "@/src/core/api/axios";

import type {
  ApiSuccessResponse,
  BatchTemplate,
  CreateBatchTemplateRequest,
  CreateBatchesFromTemplatesRequest,
  CreateBatchesFromTemplatesResult,
  UpdateBatchTemplateRequest,
} from "@/src/features/batch-templates/types/batch-template.types";

class BatchTemplateService {
  private readonly basePath = "/admin/batch-templates";

  async listTemplates(params?: {
    isActive?: boolean;
  }): Promise<BatchTemplate[]> {
    const response = await apiClient.get<
      ApiSuccessResponse<BatchTemplate[]>
    >(this.basePath, {
      params:
        params?.isActive === undefined
          ? undefined
          : { isActive: params.isActive },
    });

    return response.data.data ?? [];
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

  async enableTemplate(id: string): Promise<BatchTemplate> {
    const response = await apiClient.post<
      ApiSuccessResponse<BatchTemplate>
    >(`${this.basePath}/${id}/enable`);
    return response.data.data;
  }

  async disableTemplate(id: string): Promise<BatchTemplate> {
    const response = await apiClient.post<
      ApiSuccessResponse<BatchTemplate>
    >(`${this.basePath}/${id}/disable`);
    return response.data.data;
  }

  async createBatchesFromTemplates(
    payload: CreateBatchesFromTemplatesRequest,
  ): Promise<
    ApiSuccessResponse<CreateBatchesFromTemplatesResult>
  > {
    const response = await apiClient.post<
      ApiSuccessResponse<CreateBatchesFromTemplatesResult>
    >(`${this.basePath}/create-batches`, payload);
    return response.data;
  }
}

export const batchTemplateService = new BatchTemplateService();
