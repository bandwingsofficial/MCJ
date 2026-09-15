"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { communityService } from "@/src/features/community/services/community.service";

import type { BulkCommunityOperationResult } from "@/src/features/community/types/community.types";

interface UseBulkActivateCommunityPostReturn {
  bulkActivate: (
    ids: string[],
  ) => Promise<BulkCommunityOperationResult | null>;
  isPending: boolean;
}

export function useBulkActivateCommunityPost(): UseBulkActivateCommunityPostReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkActivate = async (ids: string[]) => {
    try {
      setIsPending(true);
      return await communityService.bulkActivate(ids);
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to activate community posts",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkActivate, isPending };
}
