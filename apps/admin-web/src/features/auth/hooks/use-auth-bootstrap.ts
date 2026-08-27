"use client";

import { useEffect, useRef } from "react";
import axios from "axios";

import { authService } from "@/src/features/auth/services/auth.service";
import {
  useAuthStore,
  UserRole,
} from "@/src/features/auth/store/auth.store";
import { TokenStorage } from "@/src/core/storage/token-storage";
import { env } from "@/src/core/config/env";
import { RefreshTokenResponseDto } from "@/src/core/types/auth.types";

async function refreshTokens(): Promise<string> {
  const refreshToken = TokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  const response = await axios.post<RefreshTokenResponseDto>(
    `${env.apiBaseUrl}/auth/refresh`,
    { refreshToken }
  );

  const { accessToken, refreshToken: newRefreshToken } =
    response.data.data;

  TokenStorage.setAccessToken(accessToken);
  TokenStorage.setRefreshToken(newRefreshToken);

  return accessToken;
}

export const useAuthBootstrap = (): void => {
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const markUnauthenticated = useAuthStore(
    (state) => state.markUnauthenticated
  );
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    const bootstrap = async () => {
      setStatus("BOOTSTRAPPING");

      const accessToken = TokenStorage.getAccessToken();
      const refreshToken = TokenStorage.getRefreshToken();

      if (!accessToken && !refreshToken) {
        markUnauthenticated();
        return;
      }

      const applyProfile = async () => {
        const response = await authService.getProfile();
        const data = response.data;

        if (data.role !== "ADMIN") {
          authService.clearLocalAuth();
          markUnauthenticated();
          return;
        }

        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          phone: data.phone ?? null,
          mfaEnabled: data.mfaEnabled,
          sessionId: data.sessionId ?? null,
        });
      };

      try {
        await applyProfile();
      } catch {
        if (!refreshToken) {
          authService.clearLocalAuth();
          markUnauthenticated();
          return;
        }

        try {
          setStatus("REFRESHING");
          await refreshTokens();
          await applyProfile();
        } catch {
          authService.clearLocalAuth();
          markUnauthenticated();
        }
      }
    };

    void bootstrap();
  }, [setUser, setStatus, markUnauthenticated]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== authService.AUTH_SYNC_KEY || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as {
          action: "login" | "logout";
        };

        if (payload.action === "logout") {
          TokenStorage.clear();
          markUnauthenticated();
          const pathname = window.location.pathname;
          const stayOnPublicPage =
            pathname.startsWith("/login") ||
            pathname.startsWith("/onboarding") ||
            pathname.startsWith("/verify-totp") ||
            /^\/jobs\/[^/]+\/apply(?:\/.*)?$/.test(pathname);
          if (!stayOnPublicPage) {
            window.location.href = "/login";
          }
        }

        if (payload.action === "login") {
          void bootstrapFromOtherTab();
        }
      } catch {
        // ignore malformed sync payloads
      }
    };

    const bootstrapFromOtherTab = async () => {
      try {
        setStatus("BOOTSTRAPPING");
        const response = await authService.getProfile();
        const data = response.data;

        if (data.role !== "ADMIN") {
          return;
        }

        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          phone: data.phone ?? null,
          mfaEnabled: data.mfaEnabled,
          sessionId: data.sessionId ?? null,
        });
      } catch {
        // ignore
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [markUnauthenticated, setStatus, setUser]);
};
