"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { tokenStorage } from "@/src/core/storage/token-storage";
import { authService } from "@/src/features/auth/services/auth.service";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

function getSafeReturn(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function AuthHandoffPage() {
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access");
    const refreshToken = params.get("refresh");
    const returnPath = getSafeReturn(searchParams.get("return"));

    if (accessToken) {
      tokenStorage.setAccessToken(accessToken);
    }

    if (refreshToken) {
      tokenStorage.setRefreshToken(refreshToken);
    }

    async function completeHandoff() {
      try {
        if (tokenStorage.getAccessToken()) {
          const profile = await authService.getProfile();
          setUser(profile);
        }
      } catch {
        // Preserve existing local session if profile refresh fails.
      }

      window.location.replace(returnPath);
    }

    void completeHandoff();
  }, [searchParams, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-10 w-10 rounded-full" />
        <p className="text-sm text-slate-600">Returning to MCJ Academy…</p>
      </div>
    </div>
  );
}
