"use client";

import { Button } from "@/src/shared/components/ui/button";

import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

interface JobActionsProps {
  job: Job;

  onView: (job: Job) => void;

  onEdit: (job: Job) => void;

  onActivate: (
    job: Job,
  ) => void;

  onDeactivate: (
    job: Job,
  ) => void;

  onDelete: (
    job: Job,
  ) => void;

  onRestore: (
    job: Job,
  ) => void;
}

export function JobActions({
  job,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
}: JobActionsProps) {
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
          label: "View",
          onClick: () =>
            onView(job),
        },
        {
          label: "Edit",
          onClick: () =>
            onEdit(job),
        },
        ...(job.isActive
          ? [
              {
                label:
                  "Deactivate",
                onClick: () =>
                  onDeactivate(
                    job,
                  ),
              },
            ]
          : [
              {
                label:
                  "Activate",
                onClick: () =>
                  onActivate(
                    job,
                  ),
              },
            ]),
        ...(job.isDeleted
          ? [
              {
                label:
                  "Restore",
                onClick: () =>
                  onRestore(
                    job,
                  ),
              },
            ]
          : [
              {
                label:
                  "Delete",
                onClick: () =>
                  onDelete(job),
              },
            ]),
      ]}
    />
  );
}