"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import { BranchJobApplicationStatusBadge } from "@/src/features/job-applications/components/BranchJobApplicationStatusBadge";
import {
  formatAppliedDate,
  formatInterviewDateTime,
  formatInterviewMode,
  getInterviewerName,
  isInterviewScheduled,
} from "@/src/features/job-applications/utils/job-application-display.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";

interface Props {
  open: boolean;
  application: JobApplicationItem | null;
  onClose: () => void;
}

type ApplicationDetail = {
  id: string;
  applicationNumber?: string;
  applicantName?: string | null;
  applicantEmail?: string | null;
  applicantPhone?: string | null;
  highestQualification?: string | null;
  yearsOfExperience?: number | null;
  currentLocation?: string | null;
  coverLetter?: string | null;
  remarks?: string | null;
  rejectionReason?: string | null;
  status?: string;
  createdAt?: string;
  expectedSalary?: number | null;
  job?: {
    id?: string;
    title?: string;
    companyName?: string;
    jobNumber?: string | null;
    employmentType?: string;
  };
  student?: {
    studentCode?: string;
    firstName?: string;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    qualification?: string | null;
    collegeName?: string | null;
    specialization?: string | null;
    city?: string | null;
    state?: string | null;
    gender?: string | null;
  } | null;
  resume?: {
    url?: string;
    originalName?: string;
  } | null;
  interviews?: Array<{
    id: string;
    scheduledAt?: string | null;
    status: string;
    mode?: string | null;
    locationOrLink?: string | null;
    notes?: string | null;
    roundNumber?: number;
    branch?: {
      branchName: string;
      branchCode: string;
    } | null;
    interviewer?: {
      name?: string;
      email?: string;
    } | null;
  }>;
};

function Info({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
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

export function BranchViewApplicationModal({
  open,
  application,
  onClose,
}: Props) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !application?.id) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await branchOpsApi.jobApplication(application.id);
        if (!cancelled) {
          setDetail(response as ApplicationDetail);
        }
      } catch (loadError) {
        if (!cancelled) {
          setDetail(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load application details.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, application?.id]);

  const activeInterview = useMemo(() => {
    if (!detail?.interviews?.length) {
      return application?.latestInterview
        ? {
            id: application.latestInterview.id,
            scheduledAt: application.latestInterview.scheduledAt,
            status: application.latestInterview.status,
            mode: application.latestInterview.mode,
            locationOrLink: application.latestInterview.locationOrLink,
            notes: application.latestInterview.notes,
            roundNumber: application.latestInterview.roundNumber,
            branch: application.latestInterview.branch,
            interviewer: application.latestInterview.interviewer
              ? {
                  name: getInterviewerName(application.latestInterview) ?? undefined,
                  email: application.latestInterview.interviewer.email,
                }
              : null,
          }
        : null;
    }

    return (
      detail.interviews.find((item) => item.status === "ASSIGNED") ??
      detail.interviews.find((item) => item.status === "SCHEDULED") ??
      detail.interviews[0]
    );
  }, [detail, application]);

  const scheduled = isInterviewScheduled(activeInterview);
  const studentName =
    [detail?.student?.firstName, detail?.student?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    detail?.applicantName ||
    application?.applicantName;

  return (
    <Modal
      open={open}
      title="View Application"
      description="Read-only application details"
      onClose={onClose}
      contentClassName="!max-w-[760px]"
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <BranchJobApplicationStatusBadge
              status={detail?.status || application?.status}
            />
            {activeInterview ? (
              <Badge
                variant={scheduled ? "success" : "warning"}
                className="px-2 py-0 text-[11px] font-semibold leading-5"
              >
                {scheduled ? "Scheduled" : "Not Scheduled"}
              </Badge>
            ) : null}
          </div>

          <Section title="Candidate Information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Full Name" value={studentName} />
              <Info
                label="Student ID"
                value={detail?.student?.studentCode}
              />
              <Info
                label="Email"
                value={
                  detail?.student?.email ||
                  detail?.applicantEmail ||
                  application?.applicantEmail
                }
              />
              <Info
                label="Phone"
                value={
                  detail?.student?.phone ||
                  detail?.applicantPhone ||
                  application?.applicantPhone
                }
              />
              <Info
                label="Qualification"
                value={
                  detail?.student?.qualification ||
                  detail?.highestQualification
                }
              />
              <Info label="College" value={detail?.student?.collegeName} />
              <Info
                label="Specialization"
                value={detail?.student?.specialization}
              />
              <Info
                label="Experience"
                value={
                  detail?.yearsOfExperience == null
                    ? null
                    : `${detail.yearsOfExperience} years`
                }
              />
              <Info
                label="Location"
                value={
                  detail?.currentLocation ||
                  [detail?.student?.city, detail?.student?.state]
                    .filter(Boolean)
                    .join(", ")
                }
              />
              <Info label="Gender" value={detail?.student?.gender} />
            </div>
          </Section>

          <Section title="Job Information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                label="Job Title"
                value={detail?.job?.title || application?.job?.title}
              />
              <Info
                label="Company"
                value={
                  detail?.job?.companyName || application?.job?.companyName
                }
              />
              <Info
                label="Job ID"
                value={
                  detail?.job?.jobNumber ||
                  application?.job?.jobNumber ||
                  detail?.job?.id ||
                  application?.job?.id
                }
              />
              <Info
                label="Employment Type"
                value={(
                  detail?.job?.employmentType ||
                  application?.job?.employmentType
                )?.replaceAll("_", " ")}
              />
            </div>
          </Section>

          <Section title="Application Information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                label="Application ID"
                value={
                  detail?.applicationNumber ||
                  application?.applicationNumber ||
                  detail?.id ||
                  application?.id
                }
              />
              <Info
                label="Applied Date"
                value={formatAppliedDate(
                  detail?.createdAt || application?.createdAt,
                )}
              />
              <Info
                label="Application Status"
                value={
                  <BranchJobApplicationStatusBadge
                    status={detail?.status || application?.status}
                  />
                }
              />
              <Info
                label="Expected Salary"
                value={
                  detail?.expectedSalary == null
                    ? null
                    : `₹${detail.expectedSalary.toLocaleString("en-IN")}`
                }
              />
            </div>
            {detail?.resume?.url ? (
              <a
                href={detail.resume.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-medium text-[#2563EB] hover:underline"
              >
                View resume
                {detail.resume.originalName
                  ? ` (${detail.resume.originalName})`
                  : ""}
              </a>
            ) : (
              <p className="mt-3 text-sm text-[#647A9B]">No resume uploaded.</p>
            )}
            {detail?.rejectionReason ? (
              <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">
                <span className="font-medium">Rejection reason: </span>
                {detail.rejectionReason}
              </div>
            ) : null}
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
                Cover Letter / Remarks
              </p>
              <p className="mt-1 text-sm text-[#102A56]">
                {detail?.coverLetter ||
                  detail?.remarks ||
                  "No cover letter provided."}
              </p>
            </div>
          </Section>

          <Section title="Assignment Information">
            {activeInterview ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Info
                  label="Assigned Branch"
                  value={
                    activeInterview.branch
                      ? `${activeInterview.branch.branchName} (${activeInterview.branch.branchCode})`
                      : null
                  }
                />
                <Info
                  label="Assigned Interviewer"
                  value={
                    activeInterview.interviewer
                      ? `${activeInterview.interviewer.name ?? "—"}${
                          activeInterview.interviewer.email
                            ? ` · ${activeInterview.interviewer.email}`
                            : ""
                        }`
                      : null
                  }
                />
                <Info label="Assignment Status" value="Assigned" />
              </div>
            ) : (
              <p className="text-sm text-[#647A9B]">No assignment found.</p>
            )}
          </Section>

          <Section title="Interview Information">
            {activeInterview ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Info
                  label="Interview Status"
                  value={scheduled ? "Scheduled" : "Not Scheduled"}
                />
                <Info
                  label="Interview Date"
                  value={
                    activeInterview.scheduledAt
                      ? new Date(
                          activeInterview.scheduledAt,
                        ).toLocaleDateString("en-IN")
                      : null
                  }
                />
                <Info
                  label="Interview Time"
                  value={
                    activeInterview.scheduledAt
                      ? new Date(
                          activeInterview.scheduledAt,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : null
                  }
                />
                <Info
                  label="Interview Round"
                  value={
                    scheduled || activeInterview.roundNumber
                      ? activeInterview.roundNumber ?? 1
                      : null
                  }
                />
                <Info
                  label="Interview Mode"
                  value={formatInterviewMode(activeInterview.mode)}
                />
                <Info
                  label={
                    activeInterview.mode === "ONLINE"
                      ? "Meeting Link"
                      : "Venue"
                  }
                  value={activeInterview.locationOrLink}
                />
                <Info
                  label="Date & Time"
                  value={
                    activeInterview.scheduledAt
                      ? formatInterviewDateTime(activeInterview.scheduledAt)
                      : null
                  }
                />
                <Info label="Remarks" value={activeInterview.notes} />
              </div>
            ) : (
              <p className="text-sm text-[#647A9B]">
                No interview details available.
              </p>
            )}
          </Section>
        </div>
      )}
    </Modal>
  );
}
