"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  ApplicationRoundProgress,
  InterviewItem,
} from "@/src/features/branch-ops/types";
import {
  formatInterviewDate,
  formatInterviewMode,
  formatInterviewResult,
  formatInterviewStatusLabel,
  formatInterviewTime,
  getInterviewResultVariant,
  getInterviewStatusVariant,
  getInterviewerDisplayName,
} from "@/src/features/interviews/utils/interview-display.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

type ApplicationDetail = {
  applicantName?: string | null;
  applicantEmail?: string | null;
  applicantPhone?: string | null;
  applicationNumber?: string;
  status?: string;
  job?: {
    title?: string;
    companyName?: string;
    jobNumber?: string | null;
    employmentType?: string;
  };
  student?: {
    firstName?: string;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    studentCode?: string;
    qualification?: string | null;
    collegeName?: string | null;
  } | null;
  roundProgress?: ApplicationRoundProgress | null;
};

interface Props {
  open: boolean;
  interview: InterviewItem | null;
  onClose: () => void;
}

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
    <section className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#102A56]">{title}</h3>
      {children}
    </section>
  );
}

export function BranchViewInterviewModal({
  open,
  interview,
  onClose,
}: Props) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !interview?.applicationId) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await branchOpsApi.jobApplication(
          interview.applicationId,
        );
        if (!cancelled) {
          setDetail(response as ApplicationDetail);
        }
      } catch (loadError) {
        if (!cancelled) {
          setDetail(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load interview details.",
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
  }, [open, interview?.applicationId]);

  if (!interview) {
    return null;
  }

  const candidateName =
    [detail?.student?.firstName, detail?.student?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    detail?.applicantName ||
    interview.application?.candidateName ||
    "—";

  const appNumber =
    detail?.applicationNumber ||
    interview.application?.applicationNumber ||
    interview.applicationId.slice(0, 8);

  const jobTitle = detail?.job?.title || interview.job?.title || "—";
  const companyName =
    detail?.job?.companyName || interview.job?.companyName || null;
  const roundLabel =
    interview.round?.name ||
    (interview.roundNumber ? `Round ${interview.roundNumber}` : "—");
  const resultLabel = formatInterviewResult(interview.result);

  return (
    <Modal
      open={open}
      title="View Interview"
      description="Read-only interview and candidate details"
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
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={getInterviewStatusVariant(interview.status)}
              className={compactBadgeClass}
            >
              {formatInterviewStatusLabel(interview.status)}
            </Badge>
            {resultLabel !== "—" ? (
              <Badge
                variant={getInterviewResultVariant(interview.result)}
                className={compactBadgeClass}
              >
                {resultLabel}
              </Badge>
            ) : null}
          </div>

          <Section title="Candidate">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Full Name" value={candidateName} />
              <Info label="Application" value={appNumber} />
              <Info
                label="Student ID"
                value={detail?.student?.studentCode}
              />
              <Info
                label="Email"
                value={
                  detail?.student?.email || detail?.applicantEmail || null
                }
              />
              <Info
                label="Phone"
                value={
                  detail?.student?.phone || detail?.applicantPhone || null
                }
              />
              <Info
                label="Qualification"
                value={detail?.student?.qualification}
              />
            </div>
          </Section>

          <Section title="Job">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Title" value={jobTitle} />
              <Info label="Company" value={companyName} />
              <Info label="Job Number" value={detail?.job?.jobNumber} />
              <Info
                label="Employment Type"
                value={detail?.job?.employmentType}
              />
            </div>
          </Section>

          <Section title="Current Interview">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Round" value={roundLabel} />
              <Info
                label="Date"
                value={formatInterviewDate(interview.scheduledAt)}
              />
              <Info
                label="Time"
                value={formatInterviewTime(interview.scheduledAt)}
              />
              <Info
                label="Mode"
                value={formatInterviewMode(interview.mode)}
              />
              <Info
                label={
                  interview.mode === "ONLINE" ? "Meeting Link" : "Venue"
                }
                value={interview.locationOrLink}
              />
              <Info
                label="Interviewer"
                value={getInterviewerDisplayName(interview)}
              />
              <Info
                label="Branch"
                value={
                  interview.branch
                    ? `${interview.branch.branchName} (${interview.branch.branchCode})`
                    : null
                }
              />
              <Info
                label="Status"
                value={formatInterviewStatusLabel(interview.status)}
              />
              <Info
                label="Result"
                value={
                  resultLabel === "—" ? (
                    "—"
                  ) : (
                    <Badge
                      variant={getInterviewResultVariant(interview.result)}
                      className={compactBadgeClass}
                    >
                      {resultLabel}
                    </Badge>
                  )
                }
              />
              <Info label="Notes" value={interview.notes} />
              <Info label="Feedback" value={interview.evaluation} />
            </div>
          </Section>
        </div>
      )}
    </Modal>
  );
}
