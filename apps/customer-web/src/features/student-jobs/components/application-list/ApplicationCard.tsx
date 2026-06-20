"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";

import { ApplicationStatusBadge } from "@/src/features/student-jobs/components/application-list/ApplicationStatusBadge";

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
  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-start justify-between">
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
          {" : "}₹
          {application.expectedSalary.toLocaleString()}
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
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() =>
            onView(application)
          }
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}