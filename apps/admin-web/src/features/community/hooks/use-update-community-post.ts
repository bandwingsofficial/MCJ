"use client";

import { useState } from "react";

import { AxiosError } from "axios";

import { appToast } from "@/src/shared/components/ui/toast";

import { communityService } from "@/src/features/community/services/community.service";
import { mapCommunityApiError } from "@/src/features/community/utils/community-form-errors";
import {
  buildCommunityMediaPayload,
  deriveCommunityPostTypeFromMedia,
  type CommunityMediaFormItem,
} from "@/src/features/community/utils/community-media.utils";

import type { CommunityFormValues } from "@/src/features/community/schemas/community.schema";
import type { UpdateCommunityPostRequest } from "@/src/features/community/types/community.types";
import type { CommunityFormFieldErrors } from "@/src/features/community/utils/community-form-errors";

import type { CommunityUploadFiles } from "@/src/features/community/hooks/use-create-community-post";

interface UseUpdateCommunityPostReturn {
  isLoading: boolean;
  isPending: boolean;
  fieldErrors: CommunityFormFieldErrors;
  updateCommunityPost: (
    id: string,
    values: CommunityFormValues,
    files?: CommunityUploadFiles,
  ) => Promise<boolean>;
  clearFieldErrors: () => void;
}

async function uploadMediaItems(
  items: CommunityMediaFormItem[],
): Promise<CommunityMediaFormItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (item.fileId || !item.file) {
        return item;
      }

      try {
        const uploadResponse = await communityService.uploadMedia(item.file);
        return {
          ...item,
          fileId: uploadResponse.data.fileId,
          url: uploadResponse.data.url,
          previewUrl: uploadResponse.data.url,
          file: null,
          isUploading: false,
          uploadError: null,
        };
      } catch (error) {
        return {
          ...item,
          isUploading: false,
          uploadError:
            error instanceof Error ? error.message : "Upload failed",
        };
      }
    }),
  );
}

function toUpdateRequest(
  values: CommunityFormValues,
  mediaItems: CommunityMediaFormItem[],
): UpdateCommunityPostRequest {
  return {
    type: deriveCommunityPostTypeFromMedia(mediaItems),
    caption: values.caption.trim(),
    hashtags: values.hashtags,
    location: values.location?.trim() || undefined,
    ctaEnabled: values.ctaEnabled,
    ctaLabel: values.ctaEnabled
      ? values.ctaButtonName?.trim() ?? null
      : null,
    ctaUrl: values.ctaEnabled
      ? values.ctaButtonLink?.trim() ?? null
      : null,
    status: values.status,
    media: buildCommunityMediaPayload(mediaItems),
  };
}

export const useUpdateCommunityPost = (
  onSuccess?: () => void,
): UseUpdateCommunityPostReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] =
    useState<CommunityFormFieldErrors>({});

  const updateCommunityPost = async (
    id: string,
    values: CommunityFormValues,
    files?: CommunityUploadFiles,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setFieldErrors({});

      const mediaItems = files?.mediaItems ?? [];
      if (mediaItems.length === 0) {
        setFieldErrors({ media: "At least one media item is required" });
        return false;
      }

      const uploadedItems = await uploadMediaItems(mediaItems);
      const failedUpload = uploadedItems.find((item) => item.uploadError);
      if (failedUpload?.uploadError) {
        setFieldErrors({ media: failedUpload.uploadError });
        return false;
      }

      const payload = toUpdateRequest(values, uploadedItems);
      const response = await communityService.updateCommunityPost(id, payload);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      const mapped = mapCommunityApiError(error);

      if (
        mapped.root &&
        (!(error instanceof AxiosError) ||
          !Object.keys(mapped).some(
            (key) => key !== "root" && mapped[key as keyof typeof mapped],
          ))
      ) {
        appToast.error(mapped.root);
      }

      setFieldErrors(mapped);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isPending: isLoading,
    fieldErrors,
    updateCommunityPost,
    clearFieldErrors: () => setFieldErrors({}),
  };
};
