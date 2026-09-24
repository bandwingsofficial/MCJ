"use client";

import { useEffect, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  InterviewRoundItem,
  JobApplicationItem,
} from "@/src/features/branch-ops/types";
import {
  getInterviewerName,
  isInterviewScheduled,
  resolveScheduleInterviewerId,
} from "@/src/features/job-applications/utils/job-application-display.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { formatInterviewRoundOrderLabel } from "@/src/features/interviews/utils/interview-round-accent.utils";
import { getApiErrorMessage } from "@/src/shared/lib/api-error";
import { appToast } from "@/src/shared/components/ui/toast";

interface Props {
  open: boolean;
  application: JobApplicationItem | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function toTimeInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toTimeString().slice(0, 5);
}

function toLocalDateInputValueFromMs(ms: number) {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function toLocalTimeInputValueFromMs(ms: number) {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  return date.toTimeString().slice(0, 5);
}

export function BranchScheduleInterviewModal({
  open,
  application,
  onClose,
  onSuccess,
}: Props) {
  const interview = application?.latestInterview ?? null;
  const scheduled = isInterviewScheduled(interview);
  const interviewerName = getInterviewerName(interview);

  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [mode, setMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [roundId, setRoundId] = useState("");
  const [notes, setNotes] = useState("");
  const [rounds, setRounds] = useState<InterviewRoundItem[]>([]);
  const [roundsLoading, setRoundsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setInterviewDate("");
      setInterviewTime("");
      setMode("ONLINE");
      setLocationOrLink("");
      setRoundId("");
      setNotes("");
      setRounds([]);
      return;
    }

    let cancelled = false;

    const loadRounds = async () => {
      try {
        setRoundsLoading(true);
        const active = await branchOpsApi.activeInterviewRounds();
        if (cancelled) return;
        setRounds(active);

        const preferred =
          application?.interviewSchedulingSuggestion?.roundId ||
          (interview?.status === "COMPLETED" &&
          (interview.nextRoundId || interview.nextRound?.id)
            ? interview.nextRoundId || interview.nextRound?.id || ""
            : interview?.roundId || interview?.round?.id || "");
        setRoundId(preferred);
      } catch (error) {
        if (!cancelled) {
          setRounds([]);
          appToast.error(
            error instanceof Error
              ? error.message
              : "Unable to load interview rounds.",
          );
        }
      } finally {
        if (!cancelled) {
          setRoundsLoading(false);
        }
      }
    };

    setInterviewDate(toDateInputValue(interview?.scheduledAt));
    setInterviewTime(toTimeInputValue(interview?.scheduledAt));
    setMode(interview?.mode === "OFFLINE" ? "OFFLINE" : "ONLINE");
    setLocationOrLink(interview?.locationOrLink ?? "");
    setNotes(interview?.notes ?? "");
    void loadRounds();

    return () => {
      cancelled = true;
    };
  }, [open, application, interview]);

  if (!application) {
    return null;
  }

  const eligibleFromMs = application?.interviewSchedulingSuggestion?.waitingSince
    ? Date.parse(application.interviewSchedulingSuggestion.waitingSince)
    : null;
  const minScheduleDate =
    eligibleFromMs != null && Number.isFinite(eligibleFromMs)
      ? toLocalDateInputValueFromMs(eligibleFromMs)
      : undefined;
  const minScheduleTime =
    eligibleFromMs != null &&
    Number.isFinite(eligibleFromMs) &&
    interviewDate &&
    minScheduleDate &&
    interviewDate === minScheduleDate
      ? toLocalTimeInputValueFromMs(eligibleFromMs)
      : undefined;
  const canSubmit =
    Boolean(interviewDate) &&
    Boolean(interviewTime) &&
    Boolean(locationOrLink.trim()) &&
    Boolean(roundId) &&
    !roundsLoading &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    const scheduledAt = new Date(`${interviewDate}T${interviewTime}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      appToast.error("Enter a valid interview date and time.");
      return;
    }

    if (
      eligibleFromMs != null &&
      Number.isFinite(eligibleFromMs) &&
      scheduledAt.getTime() < eligibleFromMs
    ) {
      appToast.error(
        "Interview date and time cannot be before the assignment or previous round clearance time.",
      );
      return;
    }

    try {
      setSubmitting(true);
      const interviewerId = resolveScheduleInterviewerId(application, roundId);
      await branchOpsApi.scheduleInterview({
        applicationId: application.id,
        scheduledAt: scheduledAt.toISOString(),
        mode,
        locationOrLink: locationOrLink.trim(),
        notes: notes.trim() || undefined,
        roundId,
        ...(interviewerId ? { interviewerId } : {}),
      });
      appToast.success(
        scheduled
          ? "Interview schedule updated successfully."
          : "Interview scheduled successfully.",
      );
      await onSuccess();
      onClose();
    } catch (error) {
      appToast.error(
        getApiErrorMessage(error, "Unable to schedule interview."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={scheduled ? "Manage Interview" : "Schedule Interview"}
      description="Set interview date, time, and mode for this assignment"
      onClose={onClose}
      contentClassName="!max-w-[560px]"
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
            {scheduled ? "Update Schedule" : "Save Schedule"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Candidate
            </p>
            <p className="mt-1 text-[#102A56]">
              {application.applicantName || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Job
            </p>
            <p className="mt-1 text-[#102A56]">
              {application.job?.title || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Assigned Interviewer
            </p>
            <p className="mt-1 text-[#102A56]">{interviewerName || "—"}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#647A9B]">
              Interview Date
            </label>
            <Input
              type="date"
              value={interviewDate}
              min={minScheduleDate}
              disabled={submitting}
              onChange={(event) => setInterviewDate(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#647A9B]">
              Interview Time
            </label>
            <Input
              type="time"
              value={interviewTime}
              min={minScheduleTime}
              disabled={submitting}
              onChange={(event) => setInterviewTime(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#647A9B]">Round</label>
            <AppSelect
              value={roundId || undefined}
              disabled={submitting || roundsLoading || rounds.length === 0}
              placeholder={
                roundsLoading
                  ? "Loading rounds..."
                  : rounds.length === 0
                    ? "No active rounds"
                    : "Select round"
              }
              options={[...rounds]
                .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                .map((round) => ({
                  label: formatInterviewRoundOrderLabel({
                    sortOrder: round.sortOrder,
                    name: round.name,
                  }),
                  value: round.id,
                }))}
              onValueChange={setRoundId}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#647A9B]">
              Interview Mode
            </label>
            <AppSelect
              value={mode}
              disabled={submitting}
              options={[
                { label: "Online", value: "ONLINE" },
                { label: "Offline", value: "OFFLINE" },
              ]}
              onValueChange={(value) => {
                setMode(value as "ONLINE" | "OFFLINE");
                setLocationOrLink("");
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#647A9B]">
              {mode === "ONLINE" ? "Meeting Link" : "Venue"}
            </label>
            <Input
              value={locationOrLink}
              disabled={submitting}
              placeholder={
                mode === "ONLINE"
                  ? "https://meet.example.com/..."
                  : "Branch address / room"
              }
              onChange={(event) => setLocationOrLink(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#647A9B]">
            Remarks / Notes (optional)
          </label>
          <Textarea
            value={notes}
            disabled={submitting}
            className="min-h-20"
            placeholder="Notes for the interview..."
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
