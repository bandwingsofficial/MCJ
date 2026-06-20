"use client";

import { ApplicationCard } from "@/src/features/student-jobs/components/application-list/ApplicationCard";

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

interface ApplicationListProps {
  applications: JobApplication[];

  onView: (
    application: JobApplication,
  ) => void;
}

export function ApplicationList({
  applications,
  onView,
}: ApplicationListProps) {
  return (
    <div className="space-y-5">
      {applications.map(
        (application) => (
          <ApplicationCard
            key={application.id}
            application={
              application
            }
            onView={onView}
          />
        ),
      )}
    </div>
  );
}