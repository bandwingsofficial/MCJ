"use client";

import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import type {
  InterviewItem,
  InterviewRoundItem,
} from "@/src/features/branch-ops/types";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/lib/toast";

interface Props {
  open: boolean;
  interview: InterviewItem | null;
  onClose: () => void;
  onSuccess: (created: InterviewItem) => Promise<void>;
}

export function BranchNextRoundModal({
  open,
  interview,
  onClose,
  onSuccess,
}: Props) {
  const [rounds, setRounds] = useState<InterviewRoundItem[]>([]);
  const [roundsLoading, setRoundsLoading] = useState(false);
  const [roundId, setRoundId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentSortOrder =
    interview?.round?.sortOrder ?? interview?.roundNumber ?? 0;

  const nextRoundOptions = useMemo(
    () =>
      rounds
        .filter((round) => round.sortOrder > currentSortOrder)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [rounds, currentSortOrder],
  );

  useEffect(() => {
    if (!open || !interview) {
      setRounds([]);
      setRoundId("");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setRoundsLoading(true);
        const active = await branchOpsApi.activeInterviewRounds();
        if (cancelled) return;
        setRounds(active);

        const next =
          active
            .filter((round) => round.sortOrder > currentSortOrder)
            .sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null;
        setRoundId(next?.id ?? "");
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

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, interview, currentSortOrder]);

  if (!interview) {
    return null;
  }

  const canSubmit =
    Boolean(roundId) && !roundsLoading && !submitting && nextRoundOptions.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      const created = await branchOpsApi.createNextRound({
        applicationId: interview.applicationId,
        roundId,
        interviewerId: interview.interviewerId ?? undefined,
      });
      appToast.success("Next round assigned");
      await onSuccess(created);
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
      title="Schedule Next Round"
      description="Assign the candidate to the next interview round"
      onClose={onClose}
      contentClassName="!max-w-[480px]"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onClose}
          >
            Skip for now
          </Button>
          <Button
            type="button"
            loading={submitting}
            disabled={!canSubmit}
            onClick={() => {
              void handleSubmit();
            }}
          >
            Assign Next Round
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-3 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
            Current Round
          </p>
          <p className="mt-1 font-medium text-[#102A56]">
            {interview.round?.name ||
              (interview.roundNumber
                ? `Round ${interview.roundNumber}`
                : "—")}
          </p>
          <p className="mt-0.5 text-xs text-[#647A9B]">
            {interview.application?.candidateName || "Candidate"}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#647A9B]">
            Next Round
          </label>
          {roundsLoading ? (
            <p className="text-sm text-[#647A9B]">Loading rounds...</p>
          ) : nextRoundOptions.length === 0 ? (
            <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No later active rounds are configured. Add another round first.
            </p>
          ) : (
            <AppSelect
              value={roundId || undefined}
              disabled={submitting}
              placeholder="Select next round"
              options={nextRoundOptions.map((round) => ({
                label: round.name,
                value: round.id,
              }))}
              onValueChange={setRoundId}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
