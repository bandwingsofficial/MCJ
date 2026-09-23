"use client";

import type { ReactNode } from "react";

import { Children, useEffect, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";

import { Loader } from "@/src/shared/components/ui/loader";

import { Modal } from "@/src/shared/components/ui/model";

import { ApplicationResumeSection } from "@/src/features/job-applications/components/ApplicationResumeSection";

import { JobApplicationAssignmentStatusCell } from "@/src/features/job-applications/components/JobApplicationAssignmentStatusCell";

import { JobApplicationInterviewStatusBadge } from "@/src/features/job-applications/components/JobApplicationInterviewStatusBadge";

import { JobApplicationInterviewTimeline } from "@/src/features/job-applications/components/JobApplicationInterviewTimeline";

import { JobApplicationStatusBadge } from "@/src/features/job-applications/components/JobApplicationStatusBadge";

import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";

import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";

import {
  canApproveApplication,
  canManageAssignment,
  canRejectApplication,
  getApplicantEmail,
  getApplicantName,
  getApplicantPhone,
  getStudentCode,
  isInterviewAssigned,
} from "@/src/features/job-applications/types/job-application.types";

import {
  getOptionalApplicationCompany,
  getOptionalApplicationCourse,
  getOptionalApplicationNoticePeriod,
  getOptionalApplicationRemarksOther,
  getOptionalApplicationSkills,
} from "@/src/features/job-applications/utils/job-application-display.utils";

interface JobApplicationDetailsDialogProps {
  open: boolean;

  application: JobApplication | null;

  isActing?: boolean;

  onClose: () => void;

  onApprove: (application: JobApplication) => void;

  onReject: (application: JobApplication) => void;

  onAssignInterview?: (application: JobApplication) => void;

  onUnassignInterview?: (application: JobApplication) => void;
}

function hasDisplayValue(value: ReactNode): boolean {
  if (value == null || value === false) {
    return false;
  }

  if (typeof value === "number") {
    return true;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed !== "" && trimmed !== "—";
  }

  return true;
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

      <div className="mt-1 text-sm text-[#102A56]">{value}</div>
    </div>
  );
}

function OptionalInfo({
  label,

  value,
}: {
  label: string;

  value: ReactNode;
}) {
  if (!hasDisplayValue(value)) {
    return null;
  }

  return <Info label={label} value={value} />;
}

function DetailSection({
  title,

  children,
}: {
  title: string;

  children: ReactNode;
}) {
  const items = Children.toArray(children).filter(
    (child) => child != null && child !== false,
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-[#102A56]">{title}</h3>

      <div className="grid gap-4 md:grid-cols-2">{items}</div>
    </section>
  );
}

function formatOptionalText(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  return value.trim();
}

export function JobApplicationDetailsDialog({
  open,

  application,

  isActing = false,

  onClose,

  onApprove,

  onReject,

  onAssignInterview,

  onUnassignInterview,
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

  const showAssign = canManageAssignment(current) && onAssignInterview;

  const assigned = isInterviewAssigned(current);

  const showUnassign =
    assigned && canManageAssignment(current) && onUnassignInterview;

  const showShortlistedDate =
    canManageAssignment(current) ||
    current.status === "SELECTED" ||
    current.status === "PLACED";

  const studentAddress =
    current.student &&
    [
      current.student.addressLine1,

      current.student.addressLine2,

      current.student.city,

      current.student.state,

      current.student.postalCode,

      current.student.country,
    ]

      .filter(Boolean)

      .join(", ");

  const coverLetter = formatOptionalText(current.coverLetter);

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

          {showUnassign ? (
            <Button
              type="button"
              variant="outline"
              disabled={isActing}
              onClick={() => onUnassignInterview?.(current)}
            >
              Unassign
            </Button>
          ) : null}

          {showAssign ? (
            <Button
              type="button"
              disabled={isActing}
              onClick={() => onAssignInterview?.(current)}
            >
              {assigned ? "Manage Assignment" : "Assign Interviewer"}
            </Button>
          ) : null}

          {showApprove ? (
            <Button
              type="button"
              variant="success"
              disabled={isActing}
              onClick={() => onApprove(current)}
            >
              Shortlist
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

          <DetailSection title="Overview">
            <OptionalInfo
              label="Application Number"
              value={current.applicationNumber}
            />
            <OptionalInfo
              label="Job Applied For"
              value={formatOptionalText(current.job?.title)}
            />
            <OptionalInfo
              label="Company"
              value={formatOptionalText(current.job?.companyName)}
            />
            <Info
              label="Status"
              value={
                <JobApplicationStatusBadge
                  status={current.status}
                  interviewStatus={current.interviewStatus}
                />
              }
            />
            <Info
              label="Interview Status"
              value={
                <JobApplicationInterviewStatusBadge application={current} />
              }
            />
            {canManageAssignment(current) || isInterviewAssigned(current) ? (
              <Info
                label="Assignment Status"
                value={
                  <JobApplicationAssignmentStatusCell application={current} />
                }
              />
            ) : null}
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
            {showShortlistedDate ? (
              <Info
                label={
                  current.status === "PLACED"
                    ? "Placed Date"
                    : canManageAssignment(current)
                      ? "Shortlisted Date"
                      : "Selected Date"
                }
                value={new Date(current.updatedAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            ) : null}
          </DetailSection>

          <DetailSection title="Candidate Information">
            <OptionalInfo label="Student ID" value={getStudentCode(current)} />

            <OptionalInfo label="Name" value={getApplicantName(current)} />

            <OptionalInfo label="Email" value={getApplicantEmail(current)} />

            <OptionalInfo label="Phone" value={getApplicantPhone(current)} />

            <OptionalInfo
              label="Location"
              value={formatOptionalText(current.currentLocation)}
            />
          </DetailSection>

          {current.student ? (
            <DetailSection title="Student Profile">
              <OptionalInfo
                label="Gender"
                value={
                  current.student.gender
                    ? current.student.gender.replaceAll("_", " ")
                    : null
                }
              />

              <OptionalInfo
                label="Date of Birth"
                value={
                  current.student.dateOfBirth
                    ? new Date(current.student.dateOfBirth).toLocaleDateString(
                        "en-IN",
                      )
                    : null
                }
              />

              <OptionalInfo label="Address" value={studentAddress || null} />

              <OptionalInfo
                label="Qualification"
                value={formatOptionalText(current.student.qualification)}
              />

              <OptionalInfo
                label="College"
                value={formatOptionalText(current.student.collegeName)}
              />

              <OptionalInfo
                label="Specialization"
                value={formatOptionalText(current.student.specialization)}
              />

              <OptionalInfo
                label="Passing Year"
                value={
                  current.student.passingYear == null
                    ? null
                    : String(current.student.passingYear)
                }
              />

              <OptionalInfo
                label="Parent / Guardian"
                value={formatOptionalText(current.student.parentName)}
              />

              <OptionalInfo
                label="Parent Phone"
                value={formatOptionalText(current.student.parentPhone)}
              />

              <OptionalInfo
                label="Emergency Contact"
                value={formatOptionalText(current.student.emergencyContactName)}
              />

              <OptionalInfo
                label="Emergency Phone"
                value={formatOptionalText(
                  current.student.emergencyContactPhone,
                )}
              />

              <OptionalInfo
                label="Student Status"
                value={
                  current.student.status
                    ? current.student.status.replaceAll("_", " ")
                    : null
                }
              />

              <OptionalInfo
                label="Job Status"
                value={
                  current.student.jobStatus
                    ? current.student.jobStatus.replaceAll("_", " ")
                    : null
                }
              />

              <OptionalInfo
                label="Notes"
                value={formatOptionalText(current.student.notes)}
              />
            </DetailSection>
          ) : null}

          <DetailSection title="Professional Information">
            <OptionalInfo
              label="Highest Qualification"
              value={formatOptionalText(current.highestQualification)}
            />

            <OptionalInfo
              label="Specialization / Course"
              value={getOptionalApplicationCourse(current)}
            />

            <OptionalInfo
              label="Current / Previous Company"
              value={getOptionalApplicationCompany(current)}
            />

            <OptionalInfo
              label="Experience"
              value={
                current.yearsOfExperience == null
                  ? null
                  : `${current.yearsOfExperience} years`
              }
            />

            <OptionalInfo
              label="Notice Period"
              value={getOptionalApplicationNoticePeriod(current)}
            />

            <OptionalInfo
              label="Skills"
              value={getOptionalApplicationSkills(current)}
            />

            <OptionalInfo
              label="Additional Notes"
              value={getOptionalApplicationRemarksOther(current)}
            />
          </DetailSection>

          <DetailSection title="Application Information">
            <OptionalInfo label="Job Title" value={current.job?.title} />

            <OptionalInfo label="Job Number" value={current.job?.jobNumber} />

            <OptionalInfo label="Company" value={current.job?.companyName} />

            <OptionalInfo
              label="Employment Type"
              value={
                current.job?.employmentType
                  ? current.job.employmentType.replaceAll("_", " ")
                  : null
              }
            />

            <OptionalInfo label="Cover Letter" value={coverLetter} />
          </DetailSection>

          {current.resumeFileId ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
                Resume
              </h3>

              <ApplicationResumeSection resumeFileId={current.resumeFileId} />
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
              Interview Timeline
            </h3>

            <JobApplicationInterviewTimeline application={current} />
          </section>
        </div>
      )}
    </Modal>
  );
}
