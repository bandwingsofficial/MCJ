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
import { formatMcjPageTitle, MCJ_ACADEMY_BRAND } from "@mcj/shared-constants";

import { resolveCustomerPageTitle } from "@/src/shared/document-title/customer-page-title-rules";

type PageTitleContextValue = {
  setPageTitleOverride: (title: string | null) => void;
};

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function DocumentTitleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [override, setOverride] = useState<string | null>(null);

  const routeTitle = useMemo(
    () => resolveCustomerPageTitle(pathname),
    [pathname],
  );

  useEffect(() => {
    setOverride(null);
  }, [pathname]);

  useEffect(() => {
    const segment = override ?? routeTitle;
    const brandSuffix = `| ${MCJ_ACADEMY_BRAND}`;

    document.title =
      segment?.trim().endsWith(brandSuffix)
        ? segment.trim()
        : formatMcjPageTitle(segment);
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
