"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import {
  JobApplicationActions,
} from "@/src/features/job-applications/components/JobApplicationActions";

import {
  JobApplicationStatusBadge,
} from "@/src/features/job-applications/components/JobApplicationStatusBadge";

import type {
  JobApplication,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationTableProps {
  applications: JobApplication[];

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

export function JobApplicationTable({
  applications,
  onView,
  onUpdateStatus,
  onDelete,
  onRestore,
}: JobApplicationTableProps) {
  return (
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
            Expected Salary
          </TableHead>

          <TableHead>
            Status
          </TableHead>

          <TableHead>
            Applied On
          </TableHead>

          <TableHead className="w-28">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {applications.map(
          (application) => (
            <TableRow
              key={
                application.id
              }
            >
              <TableCell>
                <div>
                  <p className="font-medium">
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
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {
                      application
                        .student
                        .studentCode
                    }
                  </p>
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
                  onView={
                    onView
                  }
                  onUpdateStatus={
                    onUpdateStatus
                  }
                  onDelete={
                    onDelete
                  }
                  onRestore={
                    onRestore
                  }
                />
              </TableCell>
            </TableRow>
          ),
        )}
      </TableBody>
    </Table>
  );
}