"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { communityService } from "@/src/features/community/services/community.service";

import type { BulkCommunityOperationResult } from "@/src/features/community/types/community.types";

interface UseBulkRestoreCommunityPostReturn {
  bulkRestore: (
    ids: string[],
  ) => Promise<BulkCommunityOperationResult | null>;
  isPending: boolean;
}

export function useBulkRestoreCommunityPost(): UseBulkRestoreCommunityPostReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkRestore = async (ids: string[]) => {
    try {
      setIsPending(true);
      return await communityService.bulkRestore(ids);
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to restore community posts",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkRestore, isPending };
}
