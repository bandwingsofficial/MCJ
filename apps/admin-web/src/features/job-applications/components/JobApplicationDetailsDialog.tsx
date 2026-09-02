"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";

import { ApplicationResumeSection } from "@/src/features/job-applications/components/ApplicationResumeSection";
import { JobApplicationStatusBadge } from "@/src/features/job-applications/components/JobApplicationStatusBadge";
import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  canApproveApplication,
  canRejectApplication,
  getApplicantEmail,
  getApplicantName,
  getApplicantPhone,
} from "@/src/features/job-applications/types/job-application.types";
import {
  getApplicationCompany,
  getApplicationCourse,
  getApplicationNoticePeriod,
  getApplicationSkills,
} from "@/src/features/job-applications/utils/job-application-display.utils";

interface JobApplicationDetailsDialogProps {
  open: boolean;
  application: JobApplication | null;
  isActing?: boolean;
  onClose: () => void;
  onApprove: (application: JobApplication) => void;
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

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-[#102A56]">{title}</h3>
      {children}
    </section>
  );
}

export function JobApplicationDetailsDialog({
  open,
  application,
  isActing = false,
  onClose,
  onApprove,
  onReject,
}: JobApplicationDetailsDialogProps) {
  const [detail, setDetail] = useState<JobApplication | null>(application);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !application?.id) {
      setDetail(application);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await jobApplicationService.getJobApplication(
          application.id,
        );
        if (!cancelled) {
          setDetail(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setDetail(application);
          setLoadError(
            err instanceof Error
              ? err.message
              : "Unable to load application details.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, application]);

  if (!application) {
    return null;
  }

  const current = detail ?? application;
  const showApprove = canApproveApplication(current.status);
  const showReject = canRejectApplication(current.status);

  return (
    <Modal
      open={open}
      title="Application Details"
      onClose={onClose}
      contentClassName="!max-w-[760px]"
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
              onClick={() => onReject(current)}
            >
              Reject
            </Button>
          ) : null}
          {showApprove ? (
            <Button
              type="button"
              variant="success"
              disabled={isActing}
              onClick={() => onApprove(current)}
            >
              Approve
            </Button>
          ) : null}
        </>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : (
        <div className="space-y-5">
          {loadError ? (
            <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {loadError}
            </p>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2">
            <Info
              label="Application Number"
              value={current.applicationNumber || "—"}
            />
            <Info
              label="Status"
              value={<JobApplicationStatusBadge status={current.status} />}
            />
            <Info
              label="Applied Date"
              value={new Date(current.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            {current.status === "SELECTED" ? (
              <Info
                label="Approved Date"
                value={new Date(current.updatedAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            ) : null}
          </section>

          <Section title="Candidate Information">
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Name" value={getApplicantName(current)} />
              <Info label="Email" value={getApplicantEmail(current)} />
              <Info label="Phone" value={getApplicantPhone(current)} />
              <Info
                label="Location"
                value={current.currentLocation || "—"}
              />
            </div>
          </Section>

          <Section title="Professional Information">
            <div className="grid gap-4 md:grid-cols-2">
              <Info
                label="Highest Qualification"
                value={current.highestQualification || "—"}
              />
              <Info
                label="Specialization / Course"
                value={getApplicationCourse(current)}
              />
              <Info
                label="Current / Previous Company"
                value={getApplicationCompany(current)}
              />
              <Info
                label="Experience"
                value={
                  current.yearsOfExperience == null
                    ? "—"
                    : `${current.yearsOfExperience} years`
                }
              />
              <Info
                label="Expected Salary"
                value={
                  current.expectedSalary == null
                    ? "—"
                    : `₹${current.expectedSalary.toLocaleString("en-IN")}`
                }
              />
              <Info
                label="Notice Period"
                value={getApplicationNoticePeriod(current)}
              />
              <Info label="Skills" value={getApplicationSkills(current)} />
            </div>
          </Section>

          <Section title="Application Information">
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Job Title" value={current.job?.title || "—"} />
              <Info
                label="Job Number"
                value={current.job?.jobNumber || "—"}
              />
              <Info
                label="Company"
                value={current.job?.companyName || "—"}
              />
              <Info
                label="Employment Type"
                value={
                  current.job?.employmentType?.replaceAll("_", " ") || "—"
                }
              />
            </div>
          </Section>

          <Section title="Resume">
            <ApplicationResumeSection resumeFileId={current.resumeFileId} />
          </Section>
        </div>
      )}
    </Modal>
  );
}
