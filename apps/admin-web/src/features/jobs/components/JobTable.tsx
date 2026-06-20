"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import { Card } from "@/src/shared/components/ui/card";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { JobActions } from "@/src/features/jobs/components/JobActions";

import { JobStatusBadge } from "@/src/features/jobs/components/JobStatusBadge";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

interface JobTableProps {
  jobs: Job[];

  isLoading: boolean;

  error: string | null;

  onRetry: () => void;

  onView: (job: Job) => void;

  onEdit: (job: Job) => void;

  onActivate: (job: Job) => void;

  onDeactivate: (job: Job) => void;

  onDelete: (job: Job) => void;

  onRestore: (job: Job) => void;
}

export function JobTable({
  jobs,
  isLoading,
  error,
  onRetry,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
}: JobTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <SkeletonTable rows={8} />
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load jobs"
        description={error}
        onRetry={onRetry}
      />
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No Jobs Found"
        description="Create your first job."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Job
            </TableHead>

            <TableHead>
              Company
            </TableHead>

            <TableHead>
              Location
            </TableHead>

            <TableHead>
              Experience
            </TableHead>

            <TableHead>
              Salary
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">
                    {job.title}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {job.employmentType.replaceAll(
                      "_",
                      " ",
                    )}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                {job.companyName}
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <p>
                    {job.city}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {job.state}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                {job.minExperience} -{" "}
                {job.maxExperience} yrs
              </TableCell>

              <TableCell>
                ₹
                {job.minSalary.toLocaleString()}{" "}
                -
                {" "}
                ₹
                {job.maxSalary.toLocaleString()}
              </TableCell>

              <TableCell>
                <JobStatusBadge
                  status={job.status}
                  isActive={job.isActive}
                />
              </TableCell>

              <TableCell className="text-right">
                <JobActions
                  job={job}
                  onView={onView}
                  onEdit={onEdit}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  onDelete={onDelete}
                  onRestore={onRestore}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}