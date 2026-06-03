"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";

import { BranchStatus } from "@/src/features/branches/types/branch.types";

interface UseUpdateStatusReturn {
  updateStatus: (
    id: string,
    status: BranchStatus
  ) => Promise<void>;

  isPending: boolean;
}

export const useUpdateStatus =
  (): UseUpdateStatusReturn => {
    const [isPending, setIsPending] =
      useState(false);

    const updateStatus = async (
      id: string,
      status: BranchStatus
    ) => {
      try {
        setIsPending(true);

        const response =
          await branchService.updateStatus(
            id,
            { status }
          );

        appToast.success(
          response.message
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update status";

        appToast.error(message);

        return ;
      } finally {
        setIsPending(false);
      }
    };

    return {
      updateStatus,
      isPending,
    };
  };