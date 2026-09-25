"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useStudentPortalNavigation } from "@/src/features/student/context/StudentPortalNavigationProvider";
import { buildStudentWebHandoffUrl } from "@/src/features/student-course/utils/student-web-handoff.utils";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

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

    window.location.href = buildStudentWebHandoffUrl("/student/learning");
  }, [navigation.isLoading, navigation.showMyCourses, router]);

  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 rounded-2xl" />
      <p className="text-sm text-slate-500">Opening your learning platform…</p>
    </div>
  );
}
