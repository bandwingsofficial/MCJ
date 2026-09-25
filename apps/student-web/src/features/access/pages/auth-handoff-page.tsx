"use client";

import { useEffect } from "react";

import { tokenStorage } from "@/src/core/storage/token-storage";
import { getStudentLearningUrl } from "@/src/features/learning/utils/routes.utils";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function AuthHandoffPage() {
  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access");
    const refreshToken = params.get("refresh");

    if (accessToken) {
      tokenStorage.setAccessToken(accessToken);
    }

    if (refreshToken) {
      tokenStorage.setRefreshToken(refreshToken);
    }

    const searchParams = new URLSearchParams(window.location.search);
    const requestedNext = searchParams.get("next");
    const nextPath =
      requestedNext?.startsWith("/student/") === true
        ? requestedNext
        : "/student/learning";

    window.location.replace(getStudentLearningUrl(nextPath));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-10 w-10 rounded-full" />
        <p className="text-sm text-slate-600">Opening your learning dashboard…</p>
      </div>
    </div>
  );
}
