"use client";

import { Card } from "@/src/shared/components/ui/card";

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

interface ApplicationJobInfoProps {
  application: JobApplication;
}

export function ApplicationJobInfo({
  application,
}: ApplicationJobInfoProps) {
  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-lg font-semibold">
        Job Information
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Company
          </p>

          <p>{application.job.companyName}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Employment Type
          </p>

          <p>{application.job.employmentType}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Current Location
          </p>

          <p>{application.currentLocation}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Expected Salary
          </p>

          <p>
            ₹
            {application.expectedSalary.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}