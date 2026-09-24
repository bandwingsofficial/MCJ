"use client";

import type { ReactNode } from "react";

import { Badge } from "@/src/shared/components/ui/badge";

import { ApplicationAdditionalNotesSection } from "@/src/features/job-applications/components/ApplicationAdditionalNotesSection";
import { ApplicationResumeSection } from "@/src/features/job-applications/components/ApplicationResumeSection";
import { JobApplicationInterviewTimeline } from "@/src/features/job-applications/components/JobApplicationInterviewTimeline";
import { JobApplicationStatusBadge } from "@/src/features/job-applications/components/JobApplicationStatusBadge";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import type { JobApplicationBranchInterviewerAssignment } from "@/src/features/job-applications/types/job-application.types";
import {
  getApplicantEmail,
  getApplicantName,
  getApplicantPhone,
  getAssignedBranchName,
  getAssignedInterviewerName,
  getAssignmentStatus,
  getAssignmentStatusLabel,
  getBranchInterviewerAssignment,
  getStudentCode,
  resolveApplicationInterviewDisplay,
  resolveInterviewPipelineDisplay,
} from "@/src/features/job-applications/types/job-application.types";
import {
  getOptionalApplicationCompany,
  getOptionalApplicationCourse,
  getOptionalApplicationNoticePeriod,
  getOptionalApplicationSkills,
} from "@/src/features/job-applications/utils/job-application-display.utils";
import {
  formatDetailDateTime,
  formatRoundHeading,
  pickActiveInterviewForDetails,
  pickPreviousRoundInterview,
  resolveApplicationWorkflowStateLabel,
} from "@/src/features/job-applications/utils/job-application-details.utils";
import {
  formatBranchAddress,
  formatInterviewDateTimeLabel,
  formatInterviewModeLabel,
  formatInterviewResultLabel,
  formatInterviewerName,
  isOnlineInterviewMode,
  isOfflineInterviewMode,
} from "@/src/features/job-applications/utils/interview-schedule.utils";

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "" && value.trim() !== "—";
}

function Info({ label, value }: { label: string; value?: ReactNode }) {
  if (value == null || value === false) {
    return null;
  }
  if (typeof value === "string" && !hasText(value)) {
    return null;
  }
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <div className="mt-1 text-sm text-[#102A56]">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-[#102A56]">{title}</h3>
      {children}
    </section>
  );
}

function RoundSummaryCard({
  title,
  interview,
  emphasizeCurrent,
}: {
  title: string;
  interview: JobApplicationBranchInterviewerAssignment;
  emphasizeCurrent?: boolean;
}) {
  const resultLabel = formatInterviewResultLabel(interview.result);
  const pipeline = resolveInterviewPipelineDisplay(interview);
  const scheduledLabel = formatInterviewDateTimeLabel(interview.scheduledAt);
  const recordedAt =
    interview.status === "COMPLETED"
      ? formatDetailDateTime(interview.updatedAt)
      : null;
  const feedback = interview.evaluation?.trim() || null;
  const modeLabel = formatInterviewModeLabel(interview.mode);
  const interviewerName = formatInterviewerName(interview.interviewer);
  const isOnline = isOnlineInterviewMode(interview.mode);
  const isOffline = isOfflineInterviewMode(interview.mode);
  const meetingLink =
    isOnline && interview.locationOrLink?.trim()
      ? interview.locationOrLink.trim()
      : null;
  const venue =
    isOffline && interview.locationOrLink?.trim()
      ? interview.locationOrLink.trim()
      : null;
  const branchAddress = formatBranchAddress(interview.branch);

  return (
    <div
      className={`rounded-lg border px-3 py-3 ${
        emphasizeCurrent
          ? "border-sky-200 bg-sky-50/50"
          : "border-slate-100 bg-slate-50/80"
      }`}
    >
      <p className="text-sm font-semibold text-[#102A56]">{title}</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <Info label="Status" value={pipeline.label} />
        {scheduledLabel ? (
          <Info label="Scheduled" value={scheduledLabel} />
        ) : null}
        {interviewerName ? (
          <Info label="Interviewer" value={interviewerName} />
        ) : null}
        {modeLabel ? <Info label="Mode" value={modeLabel} /> : null}
        {resultLabel ? <Info label="Result" value={resultLabel} /> : null}
        {recordedAt ? (
          <Info
            label={
              interview.result === "REJECTED"
                ? "Rejected At"
                : interview.result === "PLACED"
                  ? "Placed At"
                  : "Cleared At"
            }
            value={recordedAt}
          />
        ) : null}
        {feedback ? <Info label="Feedback" value={feedback} /> : null}
        {isOffline && interview.branch?.branchName ? (
          <Info label="Branch" value={interview.branch.branchName} />
        ) : null}
        {venue ? <Info label="Venue" value={venue} /> : null}
        {branchAddress && isOffline ? (
          <Info label="Address" value={branchAddress} />
        ) : null}
      </div>
      {isOnline && meetingLink ? (
        <div className="mt-3">
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-md bg-[#2563EB] px-3 text-sm font-medium text-white shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:bg-[#1D4ED8]"
          >
            Join Interview
          </a>
        </div>
      ) : null}
    </div>
  );
}

interface Props {
  application: JobApplication;
}

export function JobApplicationDetailsContent({ application }: Props) {
  const assignment = getBranchInterviewerAssignment(application);
  const activeInterview = pickActiveInterviewForDetails(application);
  const previousInterview = pickPreviousRoundInterview(
    application,
    activeInterview,
  );
  const workflowLabel = resolveApplicationWorkflowStateLabel(application);
  const interviewDisplay = resolveApplicationInterviewDisplay(application);

  const studentAddress = application.student
    ? [
        application.student.addressLine1,
        application.student.addressLine2,
        application.student.city,
        application.student.state,
        application.student.postalCode,
        application.student.country,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info" className="px-2 py-0 text-[11px] font-semibold">
          Current Status: {workflowLabel}
        </Badge>
        <JobApplicationStatusBadge
          status={application.status}
          interviewStatus={application.interviewStatus}
        />
        <Badge
          variant={interviewDisplay.variant}
          className="px-2 py-0 text-[11px] font-semibold"
        >
          {interviewDisplay.label}
        </Badge>
      </div>

      <Section title="Candidate">
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Full Name" value={getApplicantName(application)} />
          <Info label="Email" value={getApplicantEmail(application)} />
          <Info label="Student ID" value={getStudentCode(application)} />
          <Info label="Phone" value={getApplicantPhone(application)} />
          <Info
            label="Location"
            value={application.currentLocation?.trim() || null}
          />
          <Info
            label="Qualification"
            value={
              application.student?.qualification?.trim() ||
              application.highestQualification?.trim() ||
              null
            }
          />
          <Info
            label="College"
            value={application.student?.collegeName?.trim() || null}
          />
          <Info
            label="Specialization"
            value={application.student?.specialization?.trim() || null}
          />
          <Info label="Address" value={studentAddress || null} />
          <Info
            label="Experience"
            value={
              application.yearsOfExperience == null
                ? null
                : `${application.yearsOfExperience} years`
            }
          />
          <Info
            label="Skills"
            value={getOptionalApplicationSkills(application)}
          />
          <Info
            label="Notice Period"
            value={getOptionalApplicationNoticePeriod(application)}
          />
        </div>
      </Section>

      <Section title="Job">
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Job Title" value={application.job?.title} />
          <Info
            label="Job / Application ID"
            value={
              application.applicationNumber?.trim() ||
              application.job?.jobNumber?.trim() ||
              null
            }
          />
          <Info label="Company" value={application.job?.companyName} />
          <Info
            label="Applied Date"
            value={formatDetailDateTime(application.createdAt)}
          />
          <Info
            label="Employment Type"
            value={
              application.job?.employmentType
                ? application.job.employmentType.replaceAll("_", " ")
                : null
            }
          />
          <Info
            label="Course / Specialization"
            value={getOptionalApplicationCourse(application)}
          />
          <Info
            label="Previous Company"
            value={getOptionalApplicationCompany(application)}
          />
        </div>
      </Section>

      <Section title="Assignment">
        {assignment ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Info
              label="Assigned Branch"
              value={getAssignedBranchName(assignment)}
            />
            <Info
              label="Assigned Interviewer"
              value={getAssignedInterviewerName(assignment)}
            />
            <Info
              label="Assignment State"
              value={getAssignmentStatusLabel(getAssignmentStatus(application))}
            />
            <Info
              label="Assigned At"
              value={formatDetailDateTime(assignment.createdAt)}
            />
          </div>
        ) : (
          <p className="text-sm text-[#647A9B]">No active branch assignment.</p>
        )}
      </Section>

      <Section title="Current Interview">
        {activeInterview ? (
          <div className="space-y-3">
            {previousInterview ? (
              <RoundSummaryCard
                title={formatRoundHeading(previousInterview)}
                interview={previousInterview}
              />
            ) : null}
            <RoundSummaryCard
              title={
                previousInterview
                  ? `Current Round: ${formatRoundHeading(activeInterview)}`
                  : formatRoundHeading(activeInterview)
              }
              interview={activeInterview}
              emphasizeCurrent
            />
          </div>
        ) : (
          <p className="text-sm text-[#647A9B]">
            No interview round is in progress yet.
          </p>
        )}
      </Section>

      {application.status === "REJECTED" &&
      application.rejectionReason?.trim() ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">
          <span className="font-medium">Application rejection: </span>
          {application.rejectionReason.trim()}
        </div>
      ) : null}

      {application.resumeFileId ? (
        <Section title="Resume">
          <ApplicationResumeSection resumeFileId={application.resumeFileId} />
        </Section>
      ) : null}

      <Section title="Additional Notes">
        <ApplicationAdditionalNotesSection application={application} />
      </Section>

      <Section title="Interview Timeline">
        <JobApplicationInterviewTimeline application={application} />
      </Section>
    </div>
  );
}
