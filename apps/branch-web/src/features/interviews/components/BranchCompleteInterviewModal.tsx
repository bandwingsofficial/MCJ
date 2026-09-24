"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import type {
  BranchUserItem,
  CompleteInterviewResult,
  InterviewItem,
  InterviewResult,
  InterviewRoundItem,
} from "@/src/features/branch-ops/types";
import { BranchJobApplicationStatusBadge } from "@/src/features/job-applications/components/BranchJobApplicationStatusBadge";
import {
  canShowJoinInterviewLink,
  formatInterviewDate,
  formatInterviewMode,
  formatInterviewStatusLabel,
  formatInterviewTime,
  getInterviewerDisplayName,
  isOfflineInterviewMode,
  isOnlineInterviewMode,
  isValidInterviewSchedule,
} from "@/src/features/interviews/utils/interview-display.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/lib/toast";
import { CalendarClock } from "lucide-react";

const RESULT_OPTIONS: Array<{ label: string; value: InterviewResult }> = [
  { label: "Selected for Next Round", value: "SELECTED_FOR_NEXT_ROUND" },
  { label: "Rejected", value: "REJECTED" },
  { label: "On Hold", value: "ON_HOLD" },
  { label: "Need Further Review", value: "NEED_FURTHER_REVIEW" },
  { label: "Placed", value: "PLACED" },
];

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
  };
  student?: {
    firstName?: string;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    studentCode?: string;
  } | null;
  roundProgress?: { nextRound?: { id: string } | null };
};

interface Props {
  open: boolean;
  interview: InterviewItem | null;
  onClose: () => void;
  onSuccess: (
    interview: CompleteInterviewResult,
    result: InterviewResult,
  ) => Promise<void>;
}

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

const fieldLabelClass =
  "text-xs font-medium uppercase tracking-wide text-[#647A9B]";

function NumberedSection({
  step,
  title,
  accent,
  children,
}: {
  step: number;
  title: string;
  accent?: "default" | "primary" | "muted";
  children: ReactNode;
}) {
  const headerBg =
    accent === "primary"
      ? "from-[#EFF6FF] to-white"
      : accent === "muted"
        ? "from-[#F8FAFC] to-white"
        : "from-[#F8FBFF] to-white";

  return (
    <section className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div
        className={`flex items-center gap-2.5 border-b border-[#E1EBF5] bg-gradient-to-r ${headerBg} px-4 py-3`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)]">
          {step}
        </span>
        <h3 className="text-sm font-semibold text-[#102A56]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
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
    <div className="min-w-0 rounded-lg border border-[#EEF4FB] bg-[#FAFCFF] px-3 py-2.5">
      <p className={fieldLabelClass}>{label}</p>
      <div className="mt-1 text-sm font-medium text-[#102A56]">
        {value || "—"}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={fieldLabelClass}>{label}</label>
      {children}
    </div>
  );
}

export function BranchCompleteInterviewModal({
  open,
  interview,
  onClose,
  onSuccess,
}: Props) {
  const [result, setResult] = useState<InterviewResult | "">("");
  const [nextRoundId, setNextRoundId] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [notes, setNotes] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [nextMode, setNextMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [nextLocationOrLink, setNextLocationOrLink] = useState("");
  const [nextInterviewerId, setNextInterviewerId] = useState("");
  const [nextRemarks, setNextRemarks] = useState("");
  const [rounds, setRounds] = useState<InterviewRoundItem[]>([]);
  const [interviewers, setInterviewers] = useState<BranchUserItem[]>([]);
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const needsNextRound = result === "SELECTED_FOR_NEXT_ROUND";

  const nextRoundOptions = useMemo(() => {
    const currentId = interview?.roundId ?? interview?.round?.id;
    return rounds
      .filter((round) => round.id !== currentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [rounds, interview?.roundId, interview?.round?.id]);

  const rescheduleStep = needsNextRound ? 5 : 4;

  useEffect(() => {
    if (!open || !interview) {
      setResult("");
      setNextRoundId("");
      setEvaluation("");
      setNotes("");
      setNextDate("");
      setNextTime("");
      setNextMode("ONLINE");
      setNextLocationOrLink("");
      setNextInterviewerId("");
      setNextRemarks("");
      setRounds([]);
      setInterviewers([]);
      setDetail(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const [active, users, application] = await Promise.all([
          branchOpsApi.activeInterviewRounds(),
          branchOpsApi
            .users({ role: "INTERVIEWER", status: "ACTIVE", take: 100 })
            .catch(() => ({ items: [] as BranchUserItem[], total: 0 })),
          branchOpsApi
            .jobApplication(interview.applicationId)
            .catch(() => null),
        ]);
        if (cancelled) return;

        setRounds(active);
        setInterviewers(users.items ?? []);
        setDetail(application as ApplicationDetail | null);

        const suggested =
          interview.nextRoundId ||
          interview.nextRound?.id ||
          (application as ApplicationDetail | null)?.roundProgress?.nextRound
            ?.id ||
          active
            .filter(
              (round) =>
                round.id !== interview.roundId &&
                round.id !== interview.round?.id &&
                (interview.round?.sortOrder == null ||
                  round.sortOrder > interview.round.sortOrder),
            )
            .sort((a, b) => a.sortOrder - b.sortOrder)[0]?.id ||
          "";
        setNextRoundId(suggested);

        if (interview.interviewerId) {
          setNextInterviewerId(interview.interviewerId);
        }
      } catch (error) {
        if (!cancelled) {
          setRounds([]);
          setInterviewers([]);
          setDetail(null);
          appToast.error(
            error instanceof Error
              ? error.message
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
  }, [open, interview]);

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
  const currentRoundLabel =
    interview.round?.name ||
    (interview.roundNumber ? `Round ${interview.roundNumber}` : "—");

  const showJoin =
    interview.status === "SCHEDULED" &&
    canShowJoinInterviewLink(interview, { workflowActive: true });

  const canSubmit =
    Boolean(result) &&
    !submitting &&
    !loading &&
    (!needsNextRound || Boolean(nextRoundId));

  const handleSubmit = async () => {
    if (!result || !canSubmit) return;

    try {
      setSubmitting(true);
      const updated = await branchOpsApi.completeInterview(interview.id, {
        result,
        nextRoundId: needsNextRound ? nextRoundId : undefined,
        evaluation: evaluation.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      appToast.success(
        needsNextRound
          ? "Result saved — schedule the next round from Job Applications"
          : "Interview result recorded",
      );
      await onSuccess(updated, result);
      onClose();
    } catch (error) {
      appToast.error(userFacingApiMessage(parseBranchOpsError(error)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Record Interview Result"
      description="Capture the outcome for this interview round"
      onClose={onClose}
      contentClassName="!max-w-[760px]"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            loading={submitting}
            disabled={!canSubmit}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {needsNextRound
              ? "Save Result & Schedule Next Round"
              : "Save Result"}
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] px-3 py-2.5">
            <BranchJobApplicationStatusBadge status={detail?.status} />
            <Badge variant="info" className={compactBadgeClass}>
              {formatInterviewStatusLabel(interview.status)}
            </Badge>
            <span className="text-xs text-[#647A9B]">
              {currentRoundLabel}
              {isValidInterviewSchedule(interview.scheduledAt)
                ? ` · ${formatInterviewDate(interview.scheduledAt)} ${formatInterviewTime(interview.scheduledAt)}`
                : ""}
            </span>
          </div>

          <NumberedSection step={1} title="Candidate & Job">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Candidate" value={candidateName} />
              <Info label="Application" value={appNumber} />
              <Info label="Job" value={jobTitle} />
              <Info label="Company" value={companyName} />
              <Info
                label="Email"
                value={
                  detail?.student?.email ||
                  detail?.applicantEmail ||
                  null
                }
              />
              <Info
                label="Phone"
                value={
                  detail?.student?.phone ||
                  detail?.applicantPhone ||
                  null
                }
              />
            </div>
          </NumberedSection>

          <NumberedSection step={2} title="Current Interview">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Round" value={currentRoundLabel} />
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
              {isValidInterviewSchedule(interview.scheduledAt) ? (
                isOnlineInterviewMode(interview.mode) ? (
                  <Info
                    label="Meeting Link"
                    value={
                      showJoin ? (
                        <a
                          href={interview.locationOrLink?.trim() || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center justify-center rounded-md bg-[#2563EB] px-3 text-sm font-medium text-white hover:bg-[#1D4ED8]"
                        >
                          Join Interview
                        </a>
                      ) : (
                        interview.locationOrLink
                      )
                    }
                  />
                ) : isOfflineInterviewMode(interview.mode) ? (
                  <Info label="Venue" value={interview.locationOrLink} />
                ) : (
                  <Info
                    label="Location"
                    value={interview.locationOrLink}
                  />
                )
              ) : null}
            </div>
          </NumberedSection>

          <NumberedSection step={3} title="Interview Result" accent="primary">
            <div className="space-y-4">
              <FormField label="Result">
                <AppSelect
                  value={result || undefined}
                  disabled={submitting}
                  placeholder="Select result"
                  options={RESULT_OPTIONS}
                  onValueChange={(value) => {
                    const next = value as InterviewResult;
                    setResult(next);
                    if (next !== "SELECTED_FOR_NEXT_ROUND") {
                      setNextDate("");
                      setNextTime("");
                      setNextLocationOrLink("");
                      setNextRemarks("");
                    }
                  }}
                />
              </FormField>
              <FormField label="Feedback (optional)">
                <Textarea
                  value={evaluation}
                  disabled={submitting}
                  className="min-h-24 border-[#DCE8F5] bg-white"
                  placeholder="Evaluation notes for this interview..."
                  onChange={(event) => setEvaluation(event.target.value)}
                />
              </FormField>
              <FormField label="Internal notes (optional)">
                <Textarea
                  value={notes}
                  disabled={submitting}
                  className="min-h-16 border-[#DCE8F5] bg-white"
                  placeholder="Internal notes..."
                  onChange={(event) => setNotes(event.target.value)}
                />
              </FormField>
            </div>
          </NumberedSection>

          {needsNextRound ? (
            <NumberedSection step={4} title="Next Round">
              <div className="space-y-3">
                <p className="rounded-lg border border-[#DCE8F5] bg-[#F8FBFF] px-3 py-2.5 text-sm leading-relaxed text-[#526581]">
                  Select the next round. Schedule it later from{" "}
                  <span className="font-medium text-[#102A56]">
                    Job Applications → Not Scheduled
                  </span>
                  .
                </p>
                <FormField label="Next Round">
                  {nextRoundOptions.length === 0 ? (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                      No other active rounds are configured. Add another round
                      first.
                    </p>
                  ) : (
                    <AppSelect
                      value={nextRoundId || undefined}
                      disabled={submitting}
                      placeholder="Select next round"
                      options={nextRoundOptions.map((round) => ({
                        label: round.name,
                        value: round.id,
                      }))}
                      onValueChange={setNextRoundId}
                    />
                  )}
                </FormField>
              </div>
            </NumberedSection>
          ) : null}

          {interview.status === "SCHEDULED" ? (
            <NumberedSection
              step={rescheduleStep}
              title="Re-Schedule"
              accent="muted"
            >
              <div className="flex flex-col gap-3 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#647A9B] shadow-sm">
                    <CalendarClock className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#102A56]">
                      Return to scheduling
                    </p>
                    <p className="mt-0.5 text-sm text-[#647A9B]">
                      Send this round back to Job Applications without recording a
                      final result.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 border-[#CBD5E1] bg-white"
                  disabled={submitting}
                  onClick={async () => {
                    if (!interview) return;
                    try {
                      setSubmitting(true);
                      await branchOpsApi.requestInterviewReschedule(
                        interview.id,
                      );
                      appToast.success("Interview marked for re-schedule");
                      await onSuccess(
                        interview as CompleteInterviewResult,
                        "PENDING",
                      );
                      onClose();
                    } catch (error) {
                      appToast.error(
                        userFacingApiMessage(parseBranchOpsError(error)),
                      );
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  Mark Re-Schedule Required
                </Button>
              </div>
            </NumberedSection>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
