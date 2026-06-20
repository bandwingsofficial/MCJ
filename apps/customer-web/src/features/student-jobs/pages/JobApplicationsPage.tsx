"use client";

import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";

import {
  ApplicationEmpty,
  ApplicationList,
  ApplicationSkeleton,
} from "@/src/features/student-jobs/components/application-list";

import { useJobApplications } from "@/src/features/student-jobs/hooks";

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

export function JobApplicationsPage() {
  const router = useRouter();

  const {
    applications,
    error,
    isLoading,
    refetch,
  } = useJobApplications();

  const handleView = (
    application: JobApplication,
  ) => {
    router.push(
      `/student/jobs/applications/${application.id}`,
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="Track your job applications."
      />

      {isLoading && (
        <ApplicationSkeleton />
      )}

      {!isLoading &&
        error && (
          <ErrorState
            title="Unable to load applications"
            description={error}
            onRetry={() => {
              void refetch();
            }}
          />
        )}

      {!isLoading &&
        !error &&
        applications.length ===
          0 && (
          <ApplicationEmpty />
        )}

      {!isLoading &&
        !error &&
        applications.length >
          0 && (
          <ApplicationList
            applications={
              applications
            }
            onView={handleView}
          />
        )}
    </div>
  );
}