"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { communityService } from "@/src/features/community/services/community.service";

export const useActivateCommunityPost = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const activateCommunityPost = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await communityService.activateCommunityPost(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, activateCommunityPost };
};

export const useDeactivateCommunityPost = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const deactivateCommunityPost = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await communityService.deactivateCommunityPost(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, deactivateCommunityPost };
};

export const useDeleteCommunityPost = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteCommunityPost = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await communityService.deleteCommunityPost(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, deleteCommunityPost };
};

export const useRestoreCommunityPost = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const restoreCommunityPost = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await communityService.restoreCommunityPost(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, restoreCommunityPost };
};

export const usePermanentDeleteCommunityPost = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const permanentDeleteCommunityPost = async (
    id: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response =
        await communityService.permanentDeleteCommunityPost(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, permanentDeleteCommunityPost };
};
