// src/features/auth/utils/clear-auth-caches.ts

import { getQueryClient } from "@/src/providers/query-client";

/** Clears TanStack Query cache so another admin never sees stale data. */
export function clearAuthCaches(): void {
  try {
    const client = getQueryClient();
    client.clear();
  } catch {
    // Query client may not be ready during early bootstrap
  }
}
