"use client";

import { Card } from "@/src/shared/components/ui/card";

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

interface ApplicationTimelineProps {
  application: JobApplication;
}

export function ApplicationTimeline({
  application,
}: ApplicationTimelineProps) {
  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">
        Timeline
      </h2>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Applied On
          </p>

          <p>
            {new Date(
              application.createdAt,
            ).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Last Updated
          </p>

          <p>
            {new Date(
              application.updatedAt,
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}