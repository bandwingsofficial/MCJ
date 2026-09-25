"use client";

import { useEffect } from "react";

import { buildStudentWebHandoffUrl } from "@/src/features/student-course/utils/student-web-handoff.utils";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface StudentWebLmsRedirectPageProps {
  targetPath: string;
}

export function StudentWebLmsRedirectPage({
  targetPath,
}: StudentWebLmsRedirectPageProps) {
  useEffect(() => {
    window.location.replace(buildStudentWebHandoffUrl(targetPath));
  }, [targetPath]);

  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 rounded-2xl" />
      <p className="text-sm text-slate-500">Opening your lesson…</p>
    </div>
  );
}
