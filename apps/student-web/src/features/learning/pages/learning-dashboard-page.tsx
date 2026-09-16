"use client";

import { useMemo, useState } from "react";

import { LearningStatusTabs } from "@/src/features/learning/components/dashboard/learning-status-tabs";
import { LmsCourseCard } from "@/src/features/learning/components/dashboard/lms-course-card";
import { useLearningDashboard } from "@/src/features/learning/hooks/use-learning-queries";
import type { CourseTabStatus } from "@/src/features/learning/utils/course-status.utils";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function LearningDashboardPage() {
  const dashboardQuery = useLearningDashboard();
  const [activeTab, setActiveTab] = useState<CourseTabStatus>("in_progress");

  const tabCounts = useMemo(() => {
    const items = dashboardQuery.data ?? [];
    return items.reduce(
      (acc, item) => {
        acc[item.tabStatus] += 1;
        return acc;
      },
      { in_progress: 0, completed: 0, upcoming: 0 },
    );
  }, [dashboardQuery.data]);

  const filteredItems = useMemo(() => {
    return (dashboardQuery.data ?? []).filter(
      (item) => item.tabStatus === activeTab,
    );
  }, [activeTab, dashboardQuery.data]);

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-full max-w-xl" />
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <ErrorState
        title="Unable to load your courses"
        description="We couldn't load your learning dashboard. Please try again."
        onRetry={() => {
          void dashboardQuery.refetch();
        }}
      />
    );
  }

  const items = dashboardQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3A]">My Learning</h1>
        <p className="mt-1 text-sm text-slate-600">
          Continue your enrolled courses and track your progress.
        </p>
      </div>

      <LearningStatusTabs
        activeTab={activeTab}
        counts={tabCounts}
        onChange={setActiveTab}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No admitted courses yet"
          description="Your enrolled courses will appear here once you have an active admitted enrollment."
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.replace("_", " ")} courses`}
          description="Courses matching this status will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <LmsCourseCard
              key={item.course.enrollmentId}
              course={item.course}
              courseDetail={item.courseDetail}
              progress={item.progress}
              metrics={item.metrics}
              tabStatus={item.tabStatus}
              startedDate={item.startedDate}
              continueLessonPath={item.continueLessonPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
