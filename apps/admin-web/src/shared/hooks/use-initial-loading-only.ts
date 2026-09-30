import { useRef } from "react";

/**
 * True only until the first time `isLoading` becomes false.
 * Prevents refetches from replacing mounted form/tab UI with skeletons.
 */
export function useInitialLoadingOnly(isLoading: boolean): boolean {
  const hasLoadedRef = useRef(false);

  if (!isLoading) {
    hasLoadedRef.current = true;
  }

  return isLoading && !hasLoadedRef.current;
}
