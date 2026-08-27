"use client";

import type { ReactNode } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";

import { JobApplicationStatusBadge } from "@/src/features/job-applications/components/JobApplicationStatusBadge";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  canAcceptApplication,
  canRejectApplication,
  getApplicantEmail,
  getApplicantName,
  getApplicantPhone,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationDetailsDialogProps {
  open: boolean;
  application: JobApplication | null;
  isActing?: boolean;
  onClose: () => void;
  onAccept: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
}

function Info({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <div className="mt-1 text-sm text-[#102A56]">{value || "—"}</div>
    </div>
  );
}

export function JobApplicationDetailsDialog({
  open,
  application,
  isActing = false,
  onClose,
  onAccept,
  onReject,
}: JobApplicationDetailsDialogProps) {
  if (!application) {
    return null;
  }

  const showAccept = canAcceptApplication(application.status);
  const showReject = canRejectApplication(application.status);

  return (
    <Modal
      open={open}
      title="Application Review"
      onClose={onClose}
      contentClassName="!max-w-[720px]"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isActing}
            onClick={onClose}
          >
            Close
          </Button>
          {showReject ? (
            <Button
              type="button"
              variant="danger"
              disabled={isActing}
              onClick={() => onReject(application)}
            >
              Reject
            </Button>
          ) : null}
          {showAccept ? (
            <Button
              type="button"
              variant="success"
              disabled={isActing}
              onClick={() => onAccept(application)}
            >
              Accept
            </Button>
          ) : null}
        </>
      }
    >
      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-2">
          <Info
            label="Application Number"
            value={application.applicationNumber || "—"}
          />
          <Info
            label="Status"
            value={<JobApplicationStatusBadge status={application.status} />}
          />
          <Info
            label="Applied Date"
            value={new Date(application.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          {application.status === "SELECTED" ? (
            <Info
              label="Accepted Date"
              value={new Date(application.updatedAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          ) : null}
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
            Candidate Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Candidate" value={getApplicantName(application)} />
            <Info label="Email" value={getApplicantEmail(application)} />
            <Info label="Phone" value={getApplicantPhone(application)} />
            <Info
              label="Current Location"
              value={application.currentLocation || "—"}
            />
            <Info
              label="Qualification"
              value={application.highestQualification || "—"}
            />
            <Info
              label="Experience"
              value={
                application.yearsOfExperience == null
                  ? "—"
                  : `${application.yearsOfExperience} years`
              }
            />
            <Info
              label="Expected Salary"
              value={
                application.expectedSalary == null
                  ? "—"
                  : `₹${application.expectedSalary.toLocaleString("en-IN")}`
              }
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
            Job Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Job" value={application.job?.title || "—"} />
            <Info
              label="Job Number"
              value={application.job?.jobNumber || "—"}
            />
            <Info
              label="Employment"
              value={application.job?.employmentType?.replaceAll("_", " ") || "—"}
            />
            <Info
              label="Company"
              value={application.job?.companyName || "—"}
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
            Application
          </h3>
          <div className="space-y-4">
            <Info
              label="Resume"
              value={
                application.resumeFileId
                  ? "Resume uploaded"
                  : "No resume attached"
              }
            />
            <Info
              label="Cover Letter"
              value={
                <p className="whitespace-pre-wrap text-sm text-[#102A56]">
                  {application.coverLetter?.trim() || "—"}
                </p>
              }
            />
            <Info
              label="Additional Information"
              value={
                <p className="whitespace-pre-wrap text-sm text-[#102A56]">
                  {application.remarks?.trim() || "—"}
                </p>
              }
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}
