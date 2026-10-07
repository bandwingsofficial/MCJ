import { BANNER_UPLOAD_FOLDER } from "@mcj/shared-constants";
import { AxiosError } from "axios";

import { apiClient } from "@/src/core/api/axios";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { getUploadFileId } from "@/src/shared/utils/upload-image.util";

import type {
  BannerDetail,
  BannerFilters,
  BannerImage,
  BannerListItem,
  BannerStatus,
  UpsertBannerRequest,
} from "@/src/features/banners/types/banner.types";

interface ListResponse {
  success: boolean;
  message: string;
  data: BannerListItem[];
  meta: {
    total: number;
    catalogTotal: number;
    skip: number;
    take: number;
  };
}

interface DetailResponse {
  success: boolean;
  message: string;
  data: BannerDetail;
}

export const bannerService = {
  async list(filters: BannerFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;

    const response = await apiClient.get<ListResponse>("/admin/banners", {
      params: {
        search: filters.search || undefined,
        status: filters.status,
        type: filters.type,
        skip: (page - 1) * pageSize,
        take: pageSize,
      },
    });

    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<DetailResponse>(`/admin/banners/${id}`);
    return response.data.data;
  },

  async create(payload: UpsertBannerRequest) {
    const response = await apiClient.post<DetailResponse>("/admin/banners", payload);
    return response.data;
  },

  async update(id: string, payload: UpsertBannerRequest) {
    const response = await apiClient.patch<DetailResponse>(
      `/admin/banners/${id}`,
      payload,
    );
    return response.data;
  },

  async setStatus(id: string, status: BannerStatus) {
    const response = await apiClient.patch(`/admin/banners/${id}/status`, {
      status,
    });
    return response.data as { message: string };
  },

  async remove(id: string) {
    const response = await apiClient.delete(`/admin/banners/${id}`);
    return response.data as { message: string };
  },

  async replaceImage(bannerId: string, imageId: string, uploadId: string) {
    const response = await apiClient.patch<{
      data: BannerImage;
      message: string;
    }>(`/admin/banners/${bannerId}/images/${imageId}`, { uploadId });

    return response.data.data;
  },

  async deleteUpload(uploadId: string) {
    await apiClient.delete(`/admin/uploads/${uploadId}/permanent`);
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", BANNER_UPLOAD_FOLDER);
    formData.append("fileName", file.name);

    const response = await apiClient.post("/admin/uploads", formData, {
      headers: { "Content-Type": undefined },
      transformRequest: [(data) => data],
    });

    return {
      uploadId: getUploadFileId(response.data),
      imageUrl: (response.data?.data?.url as string | undefined) ?? "",
    };
  },

  getError(error: unknown) {
    if (error instanceof AxiosError) {
      return getErrorMessage(error);
    }

    return error instanceof Error ? error.message : "Something went wrong.";
  },
};
