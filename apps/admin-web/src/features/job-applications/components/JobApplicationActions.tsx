"use client";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  JobApplication,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationActionsProps {
  application: JobApplication;

  onView: (
    application: JobApplication,
  ) => void;

  onUpdateStatus: (
    application: JobApplication,
  ) => void;

  onDelete: (
    application: JobApplication,
  ) => void;

  onRestore: (
    application: JobApplication,
  ) => void;
}

export function JobApplicationActions({
  application,
  onView,
  onUpdateStatus,
  onDelete,
  onRestore,
}: JobApplicationActionsProps) {
  return (
    <Dropdown
      trigger={
        <Button
          variant="outline"
          size="sm"
        >
          Actions
        </Button>
      }
      items={[
        {
          label: "View Details",
          onClick: () =>
            onView(application),
        },
        {
          label: "Update Status",
          onClick: () =>
            onUpdateStatus(
              application,
            ),
        },
        ...(application.isDeleted
          ? [
              {
                label: "Restore",
                onClick: () =>
                  onRestore(
                    application,
                  ),
              },
            ]
          : [
              {
                label: "Delete",
                onClick: () =>
                  onDelete(
                    application,
                  ),
              },
            ]),
      ]}
    />
  );
}