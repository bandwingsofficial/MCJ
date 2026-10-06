"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { formatMcjPageTitle } from "@mcj/shared-constants";

import { resolveBranchPageTitle } from "@/src/shared/document-title/branch-page-title-rules";

type PageTitleContextValue = {
  setPageTitleOverride: (title: string | null) => void;
};

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function DocumentTitleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [override, setOverride] = useState<string | null>(null);

  const routeTitle = useMemo(
    () => resolveBranchPageTitle(pathname),
    [pathname],
  );

  useEffect(() => {
    setOverride(null);
  }, [pathname]);

  useEffect(() => {
    document.title = formatMcjPageTitle(override ?? routeTitle);
  }, [override, routeTitle]);

  const setPageTitleOverride = useCallback((title: string | null) => {
    setOverride(title);
  }, []);

  const contextValue = useMemo(
    () => ({ setPageTitleOverride }),
    [setPageTitleOverride],
  );

  return (
    <PageTitleContext.Provider value={contextValue}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function useBrowserPageTitle(title: string | null | undefined) {
  const context = useContext(PageTitleContext);

  useEffect(() => {
    if (!context) {
      return;
    }

    if (title == null || !title.trim()) {
      return;
    }

    context.setPageTitleOverride(title.trim());

    return () => {
      context.setPageTitleOverride(null);
    };
  }, [context, title]);
}
