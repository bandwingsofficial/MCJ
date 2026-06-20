"use client";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { Loader } from "@/src/shared/components/ui/loader";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import {
  ApplicationHeader,
  ApplicationJobInfo,
  ApplicationStatus,
  ApplicationStudentInfo,
  ApplicationTimeline,
} from "@/src/features/student-jobs/components/application-details";

import { useJobApplication } from "@/src/features/student-jobs/hooks";

interface JobApplicationDetailsPageProps {
  applicationId: string;
}

export function JobApplicationDetailsPage({
  applicationId,
}: JobApplicationDetailsPageProps) {
  const {
    application,
    error,
    isLoading,
    refetch,
  } = useJobApplication(
    applicationId,
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error || !application) {
    return (
      <ErrorState
        title="Unable to load application"
        description={
          error ??
          "Application not found."
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Details"
        description="Review your submitted application."
      />

      <ApplicationHeader
        application={application}
      />

      <ApplicationJobInfo
        application={application}
      />

      <ApplicationStudentInfo
        application={application}
      />

      <ApplicationStatus
        application={application}
      />

      <ApplicationTimeline
        application={application}
      />
    </div>
  );
}