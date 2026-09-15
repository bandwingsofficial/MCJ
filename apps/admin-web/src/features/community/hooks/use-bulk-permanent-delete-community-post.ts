"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { communityService } from "@/src/features/community/services/community.service";

import type { BulkCommunityOperationResult } from "@/src/features/community/types/community.types";

interface UseBulkPermanentDeleteCommunityPostReturn {
  bulkPermanentDelete: (
    ids: string[],
  ) => Promise<BulkCommunityOperationResult | null>;
  isPending: boolean;
}

export function useBulkPermanentDeleteCommunityPost(): UseBulkPermanentDeleteCommunityPostReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkPermanentDelete = async (ids: string[]) => {
    try {
      setIsPending(true);
      return await communityService.bulkPermanentDelete(ids);
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to permanently delete community posts",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkPermanentDelete, isPending };
}
