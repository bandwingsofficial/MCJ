"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  InterviewItem,
  JobApplicationBranchInterview,
} from "@/src/features/branch-ops/types";
import { BranchJobApplicationStatusBadge } from "@/src/features/job-applications/components/BranchJobApplicationStatusBadge";
import {
  getInterviewerName,
  listBranchApplicationInterviews,
  pickBranchConductInterview,
} from "@/src/features/job-applications/utils/job-application-display.utils";
import {
  canShowJoinInterviewLink,
  formatInterviewDate,
  formatInterviewMode,
  formatInterviewResult,
  formatInterviewStatusLabel,
  formatInterviewTime,
  getInterviewResultVariant,
  getInterviewerDisplayName,
  isOfflineInterviewMode,
  isOnlineInterviewMode,
  isValidInterviewSchedule,
} from "@/src/features/interviews/utils/interview-display.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";

type ApplicationDetail = {
  id: string;
  applicationNumber?: string;
  applicantName?: string | null;
  applicantEmail?: string | null;
  applicantPhone?: string | null;
  status?: string;
  createdAt?: string;
  rejectionReason?: string | null;
  branchAssignedAt?: string | null;
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
  } | null;
  interviews?: JobApplicationBranchInterview[];
};

interface Props {
  open: boolean;
  interview: InterviewItem | null;
  onClose: () => void;
}

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

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

/** Read-only interview details (enhanced timeline + join link). */
export function BranchInterviewWorkspaceModal({
  open,
  interview: listInterview,
  onClose,
}: Props) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !listInterview?.applicationId) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const application = await branchOpsApi.jobApplication(
          listInterview.applicationId,
        );
        if (!cancelled) {
          setDetail(application as ApplicationDetail);
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
  }, [open, listInterview?.applicationId, listInterview?.id]);

  const interviewRows = useMemo(
    () =>
      listInterview
        ? listBranchApplicationInterviews(
            { branchInterviews: undefined, latestInterview: null },
            detail?.interviews,
          )
        : [],
    [detail?.interviews, listInterview],
  );

  const conductInterview = useMemo(
    () =>
      listInterview
        ? pickBranchConductInterview(
            { branchInterviews: undefined, latestInterview: null },
            interviewRows,
          )
        : null,
    [interviewRows, listInterview],
  );

  const currentInterview = useMemo((): JobApplicationBranchInterview | null => {
    if (!listInterview) return null;
    const fromDetail = interviewRows.find((row) => row.id === listInterview.id);
    if (fromDetail) return fromDetail;
    return conductInterview;
  }, [conductInterview, interviewRows, listInterview]);

  if (!listInterview) {
    return null;
  }

  const candidateName =
    [detail?.student?.firstName, detail?.student?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    detail?.applicantName ||
    listInterview.application?.candidateName ||
    "—";

  const appNumber =
    detail?.applicationNumber ||
    listInterview.application?.applicationNumber ||
    listInterview.applicationId.slice(0, 8);

  const jobTitle = detail?.job?.title || listInterview.job?.title || "—";
  const companyName =
    detail?.job?.companyName || listInterview.job?.companyName || null;

  const roundLabel =
    currentInterview?.round?.name ||
    listInterview.round?.name ||
    (currentInterview?.roundNumber
      ? `Round ${currentInterview.roundNumber}`
      : "—");

  const focusForJoin = conductInterview ?? currentInterview;
  const showJoin =
    focusForJoin &&
    canShowJoinInterviewLink(focusForJoin, {
      workflowActive: focusForJoin.id === conductInterview?.id,
    });

  return (
    <Modal
      open={open}
      title="Interview Details"
      description="Read-only interview and application details"
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
            <BranchJobApplicationStatusBadge status={detail?.status} />
            <Badge
              variant={
                currentInterview?.status === "SCHEDULED" ? "info" : "default"
              }
              className={compactBadgeClass}
            >
              {formatInterviewStatusLabel(
                currentInterview?.status ?? listInterview.status,
              )}
            </Badge>
          </div>

          <Section title="Candidate Information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Full Name" value={candidateName} />
              <Info label="Application" value={appNumber} />
              <Info label="Student ID" value={detail?.student?.studentCode} />
              <Info
                label="Email"
                value={detail?.student?.email || detail?.applicantEmail}
              />
              <Info
                label="Phone"
                value={detail?.student?.phone || detail?.applicantPhone}
              />
              <Info
                label="Qualification"
                value={detail?.student?.qualification}
              />
            </div>
          </Section>

          <Section title="Job Information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Title" value={jobTitle} />
              <Info label="Company" value={companyName} />
              <Info label="Job Number" value={detail?.job?.jobNumber} />
              <Info
                label="Employment Type"
                value={detail?.job?.employmentType?.replaceAll("_", " ")}
              />
            </div>
          </Section>

          <Section title="Current Interview">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Round" value={roundLabel} />
              <Info
                label="Date"
                value={formatInterviewDate(
                  currentInterview?.scheduledAt ?? listInterview.scheduledAt,
                )}
              />
              <Info
                label="Time"
                value={formatInterviewTime(
                  currentInterview?.scheduledAt ?? listInterview.scheduledAt,
                )}
              />
              <Info
                label="Mode"
                value={formatInterviewMode(
                  currentInterview?.mode ?? listInterview.mode,
                )}
              />
              <Info
                label="Interviewer"
                value={
                  currentInterview
                    ? getInterviewerName(
                        currentInterview as NonNullable<
                          import("@/src/features/branch-ops/types").JobApplicationItem["latestInterview"]
                        >,
                      ) ?? getInterviewerDisplayName(listInterview)
                    : getInterviewerDisplayName(listInterview)
                }
              />
              <Info
                label="Status"
                value={formatInterviewStatusLabel(
                  currentInterview?.status ?? listInterview.status,
                )}
              />
              <Info
                label="Result"
                value={
                  formatInterviewResult(
                    currentInterview?.result ?? listInterview.result,
                  ) === "Pending" ? (
                    "—"
                  ) : (
                    <Badge
                      variant={getInterviewResultVariant(
                        currentInterview?.result ?? listInterview.result,
                      )}
                      className={compactBadgeClass}
                    >
                      {formatInterviewResult(
                        currentInterview?.result ?? listInterview.result,
                      )}
                    </Badge>
                  )
                }
              />
              {isValidInterviewSchedule(
                currentInterview?.scheduledAt ?? listInterview.scheduledAt,
              ) ? (
                <>
                  {isOnlineInterviewMode(
                    currentInterview?.mode ?? listInterview.mode,
                  ) ? (
                    <Info
                      label="Meeting Link"
                      value={
                        showJoin ? (
                          <a
                            href={
                              (
                                currentInterview?.locationOrLink ??
                                listInterview.locationOrLink
                              )?.trim() || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center justify-center rounded-md bg-[#2563EB] px-3 text-sm font-medium text-white hover:bg-[#1D4ED8]"
                          >
                            Join Interview
                          </a>
                        ) : (
                          currentInterview?.locationOrLink ??
                          listInterview.locationOrLink
                        )
                      }
                    />
                  ) : isOfflineInterviewMode(
                      currentInterview?.mode ?? listInterview.mode,
                    ) ? (
                    <Info
                      label="Venue"
                      value={
                        currentInterview?.locationOrLink ??
                        listInterview.locationOrLink
                      }
                    />
                  ) : null}
                </>
              ) : null}
              <Info
                label="Feedback"
                value={currentInterview?.evaluation ?? listInterview.evaluation}
              />
            </div>
          </Section>
        </div>
      )}
    </Modal>
  );
}
