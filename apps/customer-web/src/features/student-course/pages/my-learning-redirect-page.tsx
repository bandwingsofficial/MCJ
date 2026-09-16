"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { env } from "@/src/core/config/env";
import { tokenStorage } from "@/src/core/storage/token-storage";
import { useStudentPortalNavigation } from "@/src/features/student/context/StudentPortalNavigationProvider";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

function buildStudentWebHandoffUrl(): string {
  const accessToken = tokenStorage.getAccessToken();
  const refreshToken = tokenStorage.getRefreshToken();
  const handoffUrl = new URL("/auth/handoff", env.STUDENT_WEB_URL);

  if (accessToken) {
    const hash = new URLSearchParams({
      access: accessToken,
      ...(refreshToken ? { refresh: refreshToken } : {}),
    }).toString();
    handoffUrl.hash = hash;
  }

  return handoffUrl.toString();
}

export function MyLearningRedirectPage() {
  const router = useRouter();
  const navigation = useStudentPortalNavigation();

  useEffect(() => {
    if (navigation.isLoading) {
      return;
    }

    if (!navigation.showMyCourses) {
      router.replace("/");
      return;
    }

    window.location.href = buildStudentWebHandoffUrl();
  }, [navigation.isLoading, navigation.showMyCourses, router]);

  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 rounded-2xl" />
      <p className="text-sm text-slate-500">Opening your learning platform…</p>
    </div>
  );
}
