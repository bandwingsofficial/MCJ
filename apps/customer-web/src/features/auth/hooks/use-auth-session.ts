"use client";

import { useEffect, useState } from "react";

import { tokenStorage } from "@/src/core/storage/token-storage";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

export function useAuthSessionReady() {
  const [authReady, setAuthReady] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setAuthReady(true);
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => {
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }

    if (!tokenStorage.getAccessToken()) {
      clearUser();
    }
  }, [authReady, clearUser, isAuthenticated]);

  const hasSession =
    authReady && Boolean(tokenStorage.getAccessToken()) && isAuthenticated;

  return { authReady, hasSession, isAuthenticated };
}
