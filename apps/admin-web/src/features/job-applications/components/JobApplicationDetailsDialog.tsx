"use client";

import { Sheet } from "@/src/shared/components/ui/sheet";
import { Badge } from "@/src/shared/components/ui/badge";
import { Separator } from "@/src/shared/components/ui/separator";

import type {
  JobApplication,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationDetailsDialogProps {
  open: boolean;

  application: JobApplication | null;

  onClose: () => void;
}

export function JobApplicationDetailsDialog({
  open,
  application,
  onClose,
}: JobApplicationDetailsDialogProps) {
  if (!application) {
    return null;
  }

  return (
    <Sheet
      open={open}
      title="Job Application Details"
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            Student Information
          </h3>

          <div className="grid gap-2 text-sm">
            <p>
              <span className="font-medium">
                Name:
              </span>{" "}
              {application.student.firstName}{" "}
              {application.student.lastName}
            </p>

            <p>
              <span className="font-medium">
                Student Code:
              </span>{" "}
              {application.student.studentCode}
            </p>

            <p>
              <span className="font-medium">
                Email:
              </span>{" "}
              {application.student.email}
            </p>

            <p>
              <span className="font-medium">
                Phone:
              </span>{" "}
              {application.student.phone}
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            Job Information
          </h3>

          <div className="grid gap-2 text-sm">
            <p>
              <span className="font-medium">
                Job Title:
              </span>{" "}
              {application.job.title}
            </p>

            <p>
              <span className="font-medium">
                Company:
              </span>{" "}
              {application.job.companyName}
            </p>

            <p>
              <span className="font-medium">
                Employment:
              </span>{" "}
              {application.job.employmentType}
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            Application
          </h3>

          <div className="grid gap-3 text-sm">
            <p>
              <span className="font-medium">
                Status:
              </span>{" "}
              <Badge variant="info">
                {application.status}
              </Badge>
            </p>

            <p>
              <span className="font-medium">
                Current Location:
              </span>{" "}
              {application.currentLocation ??
                "-"}
            </p>

            <p>
              <span className="font-medium">
                Expected Salary:
              </span>{" "}
              {application.expectedSalary
                ? `₹${application.expectedSalary.toLocaleString()}`
                : "-"}
            </p>

            <div>
              <p className="font-medium mb-1">
                Cover Letter
              </p>

              <p className="text-muted-foreground whitespace-pre-wrap">
                {application.coverLetter ??
                  "-"}
              </p>
            </div>

            <div>
              <p className="font-medium mb-1">
                Remarks
              </p>

              <p className="text-muted-foreground whitespace-pre-wrap">
                {application.remarks ??
                  "-"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </Sheet>
  );
}