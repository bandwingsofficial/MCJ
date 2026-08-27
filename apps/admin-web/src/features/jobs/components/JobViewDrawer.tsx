"use client";

import type { ReactNode } from "react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Modal } from "@/src/shared/components/ui/model";

import { JobStatusBadge } from "@/src/features/jobs/components/JobStatusBadge";
import { EMPLOYMENT_TYPES, WORK_MODES } from "@/src/features/jobs/constants/job.constants";
import { getJobLifecycleStatus } from "@/src/features/jobs/hooks/useJobs";
import type { Job } from "@/src/features/jobs/types/job.types";
import { formatInr } from "@/src/features/jobs/utils/job-form.utils";

interface JobViewDrawerProps {
  open: boolean;
  job?: Job | null;
  title?: string;
  onClose: () => void;
  footer?: ReactNode;
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

function listOrDash(values?: string[] | null) {
  if (!values?.length) {
    return "—";
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
    </div>
  );
}

export function JobViewDrawer({
  open,
  job,
  title = "Job Details",
  onClose,
  footer,
}: JobViewDrawerProps) {
  if (!job) {
    return null;
  }

  const salary =
    job.minSalary == null && job.maxSalary == null
      ? "—"
      : job.maxSalary && job.maxSalary !== job.minSalary
        ? `${formatInr(job.minSalary)} – ${formatInr(job.maxSalary)}`
        : formatInr(job.minSalary);

  const employment =
    EMPLOYMENT_TYPES.find((item) => item.value === job.employmentType)?.label ??
    job.employmentType.replaceAll("_", " ");
  const workMode =
    WORK_MODES.find((item) => item.value === job.workMode)?.label ??
    (job.isRemote ? "Remote" : "On-site");

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      contentClassName="!max-w-[800px]"
      footer={footer}
    >
      <div className="space-y-5">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt=""
            className="h-20 w-full max-w-xs rounded-xl border border-[#DCE8F5] object-cover"
          />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Company" value={job.companyName} />
          <Info label="Job Title" value={job.title} />
          <Info label="Job Number" value={job.jobNumber || "Pending approval"} />
          <Info label="Category" value={job.category} />
          <Info label="Job Type" value={employment} />
          <Info label="Work Mode" value={workMode} />
          <Info label="Location" value={job.location || job.city || "—"} />
          <Info label="Department" value={job.department} />
          <Info label="Salary" value={salary} />
          <Info
            label="Experience"
            value={`${job.minExperience ?? 0} – ${job.maxExperience ?? 0} years`}
          />
          <Info label="Openings" value={job.vacancies} />
          <Info
            label="Expiry Date"
            value={
              job.applicationDeadline
                ? new Date(job.applicationDeadline).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"
            }
          />
          <Info label="Company Email" value={job.companyEmail} />
          <Info label="Company Phone" value={job.companyPhone} />
          <Info label="Website" value={job.companyWebsite} />
          <Info
            label="Status"
            value={
              job.source === "COMPANY_ONBOARDING" &&
              (job.status === "PENDING_APPROVAL" || job.status === "REJECTED") ? (
                <JobStatusBadge variant="onboarding" job={job} />
              ) : (
                <JobStatusBadge
                  status={getJobLifecycleStatus(job)}
                  job={job}
                />
              )
            }
          />
        </div>

        <Info label="Qualifications" value={listOrDash(job.qualifications)} />
        <Info label="Required Skills" value={listOrDash(job.skills)} />
        <Info label="Preferred Skills" value={listOrDash(job.preferredSkills)} />

        {job.description ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#102A56]">
              {job.description}
            </p>
          </div>
        ) : null}

        {job.responsibilities.length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Responsibilities
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#102A56]">
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {job.benefits ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Benefits
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#102A56]">
              {job.benefits}
            </p>
          </div>
        ) : null}

        {job.interviewProcess?.[0]?.description ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Interview Process
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#102A56]">
              {job.interviewProcess[0].description}
            </p>
          </div>
        ) : null}

        {job.rejectionReason ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Rejection Reason
            </p>
            <p className="mt-1 text-sm text-[#102A56]">{job.rejectionReason}</p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
