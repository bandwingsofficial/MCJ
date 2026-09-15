"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { communityService } from "@/src/features/community/services/community.service";

import type { BulkCommunityOperationResult } from "@/src/features/community/types/community.types";

interface UseBulkDeleteCommunityPostReturn {
  bulkDelete: (
    ids: string[],
  ) => Promise<BulkCommunityOperationResult | null>;
  isPending: boolean;
}

export function useBulkDeleteCommunityPost(): UseBulkDeleteCommunityPostReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkDelete = async (ids: string[]) => {
    try {
      setIsPending(true);
      return await communityService.bulkDelete(ids);
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to archive community posts",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkDelete, isPending };
}
