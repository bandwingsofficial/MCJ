"use client";

import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";

import { ApplicationStatusBadge } from "@/src/features/student-jobs/components/application-list/ApplicationStatusBadge";
import { ApplicationInterviewStatusBadge } from "@/src/features/student-jobs/components/application-list/ApplicationInterviewStatusBadge";
import {
  canReapplyToJob,
  isUnderReviewStatus,
} from "@/src/features/student-jobs/utils/job-application-status.utils";
import { resolveCustomerInterviewStatusForDisplay } from "@/src/features/student-jobs/utils/job-application-interview.utils";

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

interface ApplicationStatusProps {
  application: JobApplication;
}

export function ApplicationStatus({
  application,
}: ApplicationStatusProps) {
  const router = useRouter();
  const showReapply = canReapplyToJob(application.status);
  const jobSlug = application.job.slug;
  const interviewStatusDisplay =
    resolveCustomerInterviewStatusForDisplay(application);

  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">
        Application Status
      </h2>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Application Status
          </p>
          <div className="mt-1">
            <ApplicationStatusBadge
              status={application.status}
              interviewStatus={application.interviewStatus}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Interview Status
          </p>
          <div className="mt-1">
            <ApplicationInterviewStatusBadge status={interviewStatusDisplay} />
          </div>
        </div>

        {isUnderReviewStatus(
          application.status,
          application.interviewStatus,
        ) ? (
          <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Application submitted successfully. Your application is under
            review. We will get back to you within 24 hours.
          </p>
        ) : null}

        {application.status === "REJECTED" ? (
          <div className="space-y-3 rounded-lg border border-red-100 bg-red-50 px-3 py-3">
            <div>
              <p className="text-sm font-medium text-red-900">
                Rejection Reason
              </p>
              <p className="mt-1 text-sm text-red-800">
                {application.rejectionReason?.trim() ||
                  "No reason provided."}
              </p>
            </div>
            {showReapply && jobSlug ? (
              <Button
                onClick={() => {
                  router.push(`/jobs/${jobSlug}/apply`);
                }}
              >
                Reapply
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
