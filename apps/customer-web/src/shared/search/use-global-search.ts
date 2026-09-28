import { useQuery } from "@tanstack/react-query";

import {
  GLOBAL_SEARCH_MIN_QUERY_LENGTH,
} from "@/src/shared/search/global-search.constants";
import { searchCustomerGlobal } from "@/src/shared/search/global-search.service";

export const GLOBAL_SEARCH_QUERY_KEY = "global-search";

export function useGlobalSearch(query: string) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= GLOBAL_SEARCH_MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: [GLOBAL_SEARCH_QUERY_KEY, trimmed],
    queryFn: () => searchCustomerGlobal(trimmed),
    enabled,
    staleTime: 30_000,
  });
}
