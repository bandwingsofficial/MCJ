"use client";

import { useCallback, useEffect, useState } from "react";

import { ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY } from "./admin-sidebar.constants";

function readCollapsedPreference(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY) ===
      "true"
    );
  } catch {
    return false;
  }
}

function persistCollapsedPreference(collapsed: boolean) {
  try {
    window.localStorage.setItem(
      ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY,
      String(collapsed),
    );
  } catch {
    // Ignore quota / private mode.
  }
}

export function useAdminSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(readCollapsedPreference());
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      persistCollapsedPreference(next);
      return next;
    });
  }, []);

  return { collapsed, toggleCollapsed };
}
