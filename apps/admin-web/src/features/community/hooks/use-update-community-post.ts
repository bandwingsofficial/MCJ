"use client";

import { useState } from "react";

import { AxiosError } from "axios";

import { appToast } from "@/src/shared/components/ui/toast";

import { communityService } from "@/src/features/community/services/community.service";
import { mapCommunityApiError } from "@/src/features/community/utils/community-form-errors";

import type { CommunityFormValues } from "@/src/features/community/schemas/community.schema";
import type {
  CommunityPostDetails,
  UpdateCommunityPostRequest,
} from "@/src/features/community/types/community.types";
import type { CommunityFormFieldErrors } from "@/src/features/community/utils/community-form-errors";

import type { CommunityUploadFiles } from "@/src/features/community/hooks/use-create-community-post";

interface UseUpdateCommunityPostReturn {
  isLoading: boolean;
  isPending: boolean;
  fieldErrors: CommunityFormFieldErrors;
  updateCommunityPost: (
    id: string,
    values: CommunityFormValues,
    existing: Pick<CommunityPostDetails, "mediaFileId">,
    files?: CommunityUploadFiles,
  ) => Promise<boolean>;
  clearFieldErrors: () => void;
}

function toUpdateRequest(
  values: CommunityFormValues,
): UpdateCommunityPostRequest {
  return {
    type: values.type,
    caption: values.caption.trim(),
    hashtags: values.hashtags,
    mentions: values.mentions,
    location: values.location?.trim() || undefined,
    status: values.status,
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
    existing: Pick<CommunityPostDetails, "mediaFileId">,
    files?: CommunityUploadFiles,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setFieldErrors({});

      const payload = toUpdateRequest(values);

      if (files?.media) {
        const uploadResponse = await communityService.uploadMedia(
          files.media,
        );
        payload.mediaFileId = uploadResponse.data.fileId;
      } else if (files?.removeMedia) {
        payload.mediaFileId = null;
      } else if (existing.mediaFileId) {
        payload.mediaFileId = existing.mediaFileId;
      }

      const response = await communityService.updateCommunityPost(
        id,
        payload,
      );
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
