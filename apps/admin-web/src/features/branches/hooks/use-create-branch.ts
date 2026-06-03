"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import {
  CreateBranchRequest,
  Branch,
} from "@/src/features/branches/types/branch.types";

import { branchService } from "@/src/features/branches/services/branch.service";

interface UseCreateBranchReturn {
  createBranch: (
    payload: CreateBranchRequest
  ) => Promise<Branch>;

  isPending: boolean;
}

export const useCreateBranch =
  (): UseCreateBranchReturn => {
    const [isPending, setIsPending] =
      useState(false);

    const createBranch = async (
      payload: CreateBranchRequest
    ) => {
      try {
        setIsPending(true);

        const response =
          await branchService.createBranch(
            payload
          );

        appToast.success(
          response.message
        );

        return response.data;
      } catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : "Failed to create branch";

  appToast.error(message);

  return Promise.reject(error);
} finally {
        setIsPending(false);
      }
    };

    return {
      createBranch,
      isPending,
    };
  };