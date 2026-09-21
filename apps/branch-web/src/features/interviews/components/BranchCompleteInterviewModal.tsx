"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import type {
  ApplicationRoundProgress,
  BranchUserItem,
  CompleteInterviewResult,
  InterviewItem,
  InterviewResult,
  InterviewRoundItem,
} from "@/src/features/branch-ops/types";
import { BranchInterviewProgressTimeline } from "@/src/features/interviews/components/BranchInterviewProgressTimeline";
import {
  formatInterviewDate,
  formatInterviewMode,
  formatInterviewStatusLabel,
  formatInterviewTime,
  getInterviewerDisplayName,
  isValidInterviewSchedule,
} from "@/src/features/interviews/utils/interview-display.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/lib/toast";

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
  roundProgress?: ApplicationRoundProgress | null;
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

function NumberedSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-semibold text-white">
          {step}
        </span>
        <h3 className="text-sm font-semibold text-[#102A56]">{title}</h3>
      </div>
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

function interviewerLabel(user: BranchUserItem): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name ? `${name} (${user.email})` : user.email;
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

  const scheduleValid =
    Boolean(nextRoundId) &&
    Boolean(nextDate) &&
    Boolean(nextTime) &&
    Boolean(nextLocationOrLink.trim()) &&
    Boolean(nextInterviewerId);

  const canSubmit =
    Boolean(result) &&
    !submitting &&
    !loading &&
    (!needsNextRound || scheduleValid);

  const handleSubmit = async () => {
    if (!result || !canSubmit) return;

    let scheduleNext:
      | {
          scheduledAt: string;
          mode: "ONLINE" | "OFFLINE";
          locationOrLink: string;
          interviewerId: string;
          notes?: string;
        }
      | undefined;

    if (needsNextRound) {
      const scheduledAt = new Date(`${nextDate}T${nextTime}:00`);
      if (Number.isNaN(scheduledAt.getTime())) {
        appToast.error("Enter a valid next-round date and time.");
        return;
      }
      scheduleNext = {
        scheduledAt: scheduledAt.toISOString(),
        mode: nextMode,
        locationOrLink: nextLocationOrLink.trim(),
        interviewerId: nextInterviewerId,
        notes: nextRemarks.trim() || undefined,
      };
    }

    try {
      setSubmitting(true);
      const updated = await branchOpsApi.completeInterview(interview.id, {
        result,
        nextRoundId: needsNextRound ? nextRoundId : undefined,
        evaluation: evaluation.trim() || undefined,
        notes: notes.trim() || undefined,
        scheduleNext,
      });
      appToast.success(
        needsNextRound
          ? "Result saved and next round scheduled"
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
      title="Record Interview Result & Schedule Next Round"
      description="Capture the outcome and optionally schedule the next round"
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
                <Info
                  label={
                    interview.mode === "ONLINE" ? "Meeting Link" : "Venue"
                  }
                  value={interview.locationOrLink}
                />
              ) : null}
            </div>
          </NumberedSection>

          <NumberedSection step={3} title="Interview Progress">
            <BranchInterviewProgressTimeline
              roundProgress={detail?.roundProgress}
            />
          </NumberedSection>

          <NumberedSection step={4} title="Interview Result">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#647A9B]">
                  Result
                </label>
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
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#647A9B]">
                  Feedback (optional)
                </label>
                <Textarea
                  value={evaluation}
                  disabled={submitting}
                  className="min-h-24 bg-white"
                  placeholder="Evaluation notes for this interview..."
                  onChange={(event) => setEvaluation(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#647A9B]">
                  Internal notes (optional)
                </label>
                <Textarea
                  value={notes}
                  disabled={submitting}
                  className="min-h-16 bg-white"
                  placeholder="Internal notes..."
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </div>
          </NumberedSection>

          {needsNextRound ? (
            <NumberedSection step={5} title="Schedule Next Round">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    Next Round
                  </label>
                  {nextRoundOptions.length === 0 ? (
                    <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
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
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#647A9B]">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={nextDate}
                      disabled={submitting}
                      className="bg-white"
                      onChange={(event) => setNextDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#647A9B]">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={nextTime}
                      disabled={submitting}
                      className="bg-white"
                      onChange={(event) => setNextTime(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    Mode
                  </label>
                  <AppSelect
                    value={nextMode}
                    disabled={submitting}
                    options={[
                      { label: "Online", value: "ONLINE" },
                      { label: "Offline", value: "OFFLINE" },
                    ]}
                    onValueChange={(value) =>
                      setNextMode(value as "ONLINE" | "OFFLINE")
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    {nextMode === "ONLINE" ? "Meeting Link" : "Venue"}
                  </label>
                  <Input
                    value={nextLocationOrLink}
                    disabled={submitting}
                    className="bg-white"
                    placeholder={
                      nextMode === "ONLINE"
                        ? "https://meet.example.com/..."
                        : "Office address / room"
                    }
                    onChange={(event) =>
                      setNextLocationOrLink(event.target.value)
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    Interviewer
                  </label>
                  {interviewers.length === 0 ? (
                    <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      No active interviewers found for this branch.
                    </p>
                  ) : (
                    <AppSelect
                      value={nextInterviewerId || undefined}
                      disabled={submitting}
                      placeholder="Select interviewer"
                      options={interviewers.map((user) => ({
                        label: interviewerLabel(user),
                        value: user.id,
                      }))}
                      onValueChange={setNextInterviewerId}
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    Remarks (optional)
                  </label>
                  <Textarea
                    value={nextRemarks}
                    disabled={submitting}
                    className="min-h-16 bg-white"
                    placeholder="Notes for the next round..."
                    onChange={(event) => setNextRemarks(event.target.value)}
                  />
                </div>
              </div>
            </NumberedSection>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
