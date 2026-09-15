"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { communityService } from "@/src/features/community/services/community.service";

import type { BulkCommunityOperationResult } from "@/src/features/community/types/community.types";

interface UseBulkDeactivateCommunityPostReturn {
  bulkDeactivate: (
    ids: string[],
  ) => Promise<BulkCommunityOperationResult | null>;
  isPending: boolean;
}

export function useBulkDeactivateCommunityPost(): UseBulkDeactivateCommunityPostReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkDeactivate = async (ids: string[]) => {
    try {
      setIsPending(true);
      return await communityService.bulkDeactivate(ids);
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to deactivate community posts",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkDeactivate, isPending };
}
