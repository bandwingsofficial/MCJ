"use client";

import {
  useMemo,
  useState,
} from "react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";

import {
  JobApplicationActions,
} from "@/src/features/job-applications/components/JobApplicationActions";

import {
  JobApplicationDeleteDialog,
} from "@/src/features/job-applications/components/JobApplicationDeleteDialog";

import {
  JobApplicationDetailsDialog,
} from "@/src/features/job-applications/components/JobApplicationDetailsDialog";

import {
  JobApplicationEmpty,
} from "@/src/features/job-applications/components/JobApplicationEmpty";

import {
  JobApplicationRestoreDialog,
} from "@/src/features/job-applications/components/JobApplicationRestoreDialog";

import {
  JobApplicationSkeleton,
} from "@/src/features/job-applications/components/JobApplicationSkeleton";

import {
  JobApplicationStatusBadge,
} from "@/src/features/job-applications/components/JobApplicationStatusBadge";

import {
  JobApplicationStatusDialog,
} from "@/src/features/job-applications/components/JobApplicationStatusDialog";

import {
  useJobApplications,
} from "@/src/features/job-applications/hooks/useJobApplications";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import type {
  JobApplication,
} from "@/src/features/job-applications/types/job-application.types";

export default function JobApplicationsPage() {
  const {
    jobApplications,
    isLoading,
    error,
    refetch,
  } =
    useJobApplications();

  const [
    selectedApplication,
    setSelectedApplication,
  ] =
    useState<JobApplication | null>(
      null,
    );

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [
    statusOpen,
    setStatusOpen,
  ] = useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    restoreOpen,
    setRestoreOpen,
  ] = useState(false);

  const applicationId =
    useMemo(
      () =>
        selectedApplication?.id ??
        null,
      [selectedApplication],
    );

  if (isLoading) {
    return (
      <JobApplicationSkeleton />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load job applications"
        description={error}
        onRetry={refetch}
      />
    );
  }

  if (
    jobApplications.length === 0
  ) {
    return (
      <JobApplicationEmpty />
    );
  }

  return (
    <>
      <PageHeader
        title="Job Applications"
        description="Manage student job applications."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Student
            </TableHead>

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
              Salary
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead>
              Applied
            </TableHead>

            <TableHead>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {jobApplications.map(
            (
              application,
            ) => (
              <TableRow
                key={
                  application.id
                }
              >
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {
                        application
                          .student
                          .firstName
                      }{" "}
                      {
                        application
                          .student
                          .lastName
                      }
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {
                        application
                          .student
                          .studentCode
                      }
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {
                    application.job
                      .title
                  }
                </TableCell>

                <TableCell>
                  {
                    application.job
                      .companyName
                  }
                </TableCell>

                <TableCell>
                  {application.currentLocation ??
                    "-"}
                </TableCell>

                <TableCell>
                  {application.expectedSalary
                    ? `₹${application.expectedSalary.toLocaleString()}`
                    : "-"}
                </TableCell>

                <TableCell>
                  <JobApplicationStatusBadge
                    status={
                      application.status
                    }
                  />
                </TableCell>

                <TableCell>
                  {new Date(
                    application.createdAt,
                  ).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <JobApplicationActions
                    application={
                      application
                    }
                    onView={(
                      value,
                    ) => {
                      setSelectedApplication(
                        value,
                      );

                      setDetailsOpen(
                        true,
                      );
                    }}
                    onUpdateStatus={(
                      value,
                    ) => {
                      setSelectedApplication(
                        value,
                      );

                      setStatusOpen(
                        true,
                      );
                    }}
                    onDelete={(
                      value,
                    ) => {
                      setSelectedApplication(
                        value,
                      );

                      setDeleteOpen(
                        true,
                      );
                    }}
                    onRestore={(
                      value,
                    ) => {
                      setSelectedApplication(
                        value,
                      );

                      setRestoreOpen(
                        true,
                      );
                    }}
                  />
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>

      <JobApplicationDetailsDialog
        open={detailsOpen}
        application={
          selectedApplication
        }
        onClose={() =>
          setDetailsOpen(
            false,
          )
        }
      />

      <JobApplicationStatusDialog
        open={statusOpen}
        application={
          selectedApplication
        }
        onClose={() =>
          setStatusOpen(
            false,
          )
        }
        onSuccess={refetch}
      />

      <JobApplicationDeleteDialog
        open={deleteOpen}
        applicationId={
          applicationId
        }
        onClose={() =>
          setDeleteOpen(
            false,
          )
        }
        onSuccess={refetch}
      />

      <JobApplicationRestoreDialog
        open={restoreOpen}
        applicationId={
          applicationId
        }
        onClose={() =>
          setRestoreOpen(
            false,
          )
        }
        onSuccess={refetch}
      />
    </>
  );
}