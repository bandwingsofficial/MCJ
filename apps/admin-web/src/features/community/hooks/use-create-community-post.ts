"use client";

import { useState } from "react";

import { AxiosError } from "axios";

import { appToast } from "@/src/shared/components/ui/toast";

import { communityService } from "@/src/features/community/services/community.service";
import { mapCommunityApiError } from "@/src/features/community/utils/community-form-errors";

import type { CommunityFormValues } from "@/src/features/community/schemas/community.schema";
import type { CreateCommunityPostRequest } from "@/src/features/community/types/community.types";
import type { CommunityFormFieldErrors } from "@/src/features/community/utils/community-form-errors";

export interface CommunityUploadFiles {
  media?: File | null;
  removeMedia?: boolean;
}

interface UseCreateCommunityPostReturn {
  isLoading: boolean;
  isPending: boolean;
  fieldErrors: CommunityFormFieldErrors;
  createCommunityPost: (
    values: CommunityFormValues,
    files?: CommunityUploadFiles,
  ) => Promise<boolean>;
  clearFieldErrors: () => void;
}

function toCreateRequest(
  values: CommunityFormValues,
): CreateCommunityPostRequest {
  return {
    type: values.type,
    caption: values.caption.trim(),
    authorName: values.authorName.trim(),
    hashtags: values.hashtags.length > 0 ? values.hashtags : undefined,
    location: values.location?.trim() || undefined,
    status: values.status,
  };
}

export const useCreateCommunityPost = (
  onSuccess?: () => void,
): UseCreateCommunityPostReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] =
    useState<CommunityFormFieldErrors>({});

  const createCommunityPost = async (
    values: CommunityFormValues,
    files?: CommunityUploadFiles,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setFieldErrors({});

      const payload = toCreateRequest(values);

      if (files?.media) {
        const uploadResponse = await communityService.uploadMedia(
          files.media,
        );
        payload.mediaFileId = uploadResponse.data.fileId;
      } else if (!files?.removeMedia) {
        setFieldErrors({ media: "Media file is required" });
        return false;
      }

      const response = await communityService.createCommunityPost(payload);
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
    createCommunityPost,
    clearFieldErrors: () => setFieldErrors({}),
  };
};
