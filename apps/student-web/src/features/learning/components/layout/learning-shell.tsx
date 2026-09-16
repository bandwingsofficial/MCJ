"use client";

import { useLearningAccessGuard } from "@/src/features/access/hooks/use-learning-access-guard";
import { LmsHeader } from "@/src/features/learning/components/layout/lms-header";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function LearningShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const { state } = useLearningAccessGuard();

  if (state !== "allowed") {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-16 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <LmsHeader title={title} subtitle={subtitle} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
