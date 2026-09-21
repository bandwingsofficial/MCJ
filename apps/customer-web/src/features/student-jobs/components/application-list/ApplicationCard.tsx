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

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

interface ApplicationCardProps {
  application: JobApplication;

  onView: (
    application: JobApplication,
  ) => void;
}

export function ApplicationCard({
  application,
  onView,
}: ApplicationCardProps) {
  const router = useRouter();
  const showReapply = canReapplyToJob(application.status);
  const jobSlug = application.job.slug;

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {application.job.title}
          </h3>

          <p className="text-sm text-muted-foreground">
            {application.job.companyName}
          </p>
        </div>

        <ApplicationStatusBadge
          status={application.status}
          interviewStatus={application.interviewStatus}
        />
      </div>

      <div className="grid gap-2 text-sm md:grid-cols-2">
        <p>
          <strong>Employment</strong>
          {" : "}
          {application.job.employmentType}
        </p>

        <p>
          <strong>Expected Salary</strong>
          {" : "}
          {application.expectedSalary != null
            ? `₹${application.expectedSalary.toLocaleString()}`
            : "Not specified"}
        </p>

        <p>
          <strong>Location</strong>
          {" : "}
          {application.currentLocation}
        </p>

        <p>
          <strong>Applied</strong>
          {" : "}
          {new Date(
            application.createdAt,
          ).toLocaleDateString()}
        </p>

        <p>
          <strong>Interview Status</strong>
          {" : "}
          <ApplicationInterviewStatusBadge
            status={application.interviewStatus ?? "NOT_YET"}
          />
        </p>
      </div>

      {isUnderReviewStatus(
        application.status,
        application.interviewStatus,
      ) ? (
        <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Your application is under review. We will get back to you within 24
          hours.
        </p>
      ) : null}

      {showReapply && application.rejectionReason ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">
          <span className="font-medium">Rejection reason: </span>
          {application.rejectionReason}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          onClick={() =>
            onView(application)
          }
        >
          View Details
        </Button>
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
    </Card>
  );
}
