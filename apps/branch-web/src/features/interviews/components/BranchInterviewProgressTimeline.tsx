"use client";

import { useMemo } from "react";

import type { ApplicationRoundProgress } from "@/src/features/branch-ops/types";
import {
  formatInterviewResult,
  getInterviewResultVariant,
  isValidInterviewSchedule,
} from "@/src/features/interviews/utils/interview-display.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { cn } from "@/src/shared/lib/cn";

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

function safeScheduleLabel(value?: string | null): string | null {
  if (!isValidInterviewSchedule(value)) return null;
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  roundProgress?: ApplicationRoundProgress | null;
  className?: string;
  emptyMessage?: string;
}

/**
 * Persisted interview history + selected next round awaiting schedule.
 * Does not list all configured future rounds as "Not started".
 */
export function BranchInterviewProgressTimeline({
  roundProgress,
  className,
  emptyMessage = "No interview progress yet.",
}: Props) {
  const progressRounds = useMemo(() => {
    const history = roundProgress?.history ?? [];
    const items: Array<{
      key: string;
      round: { id: string; name: string; sortOrder: number };
      history: (typeof history)[number] | null;
      pendingNext?: boolean;
    }> = [];

    for (const item of history) {
      if (!item.round) continue;
      items.push({
        key: item.interviewId,
        round: item.round,
        history: item,
      });
    }

    const selectedNext = roundProgress?.nextRound;
    const nextAlreadyOpen = history.some(
      (item) =>
        item.roundId === selectedNext?.id &&
        (item.status === "ASSIGNED" || item.status === "SCHEDULED"),
    );

    if (selectedNext && !nextAlreadyOpen) {
      const alreadyListed = items.some(
        (item) => item.round.id === selectedNext.id,
      );
      if (!alreadyListed) {
        items.push({
          key: `next-${selectedNext.id}`,
          round: selectedNext,
          history: null,
          pendingNext: true,
        });
      }
    }

    return items.sort((a, b) => a.round.sortOrder - b.round.sortOrder);
  }, [roundProgress?.history, roundProgress?.nextRound]);

  const currentRoundId = roundProgress?.currentRound?.id;
  const nextRoundId = roundProgress?.nextRound?.id;

  if (progressRounds.length === 0) {
    return <p className="text-sm text-[#647A9B]">{emptyMessage}</p>;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {roundProgress?.currentRound ? (
        <p className="text-xs text-[#647A9B]">
          Current Round:{" "}
          <span className="font-medium text-[#102A56]">
            {roundProgress.currentRound.name}
          </span>
          {roundProgress.nextRound ? (
            <>
              {" · "}Next:{" "}
              <span className="font-medium text-[#102A56]">
                {roundProgress.nextRound.name}
              </span>
            </>
          ) : null}
        </p>
      ) : null}
      <ol className="space-y-2">
        {progressRounds.map(({ key, round, history, pendingNext }) => {
          const isCurrent = currentRoundId === round.id && !pendingNext;
          const isNext = nextRoundId === round.id;
          const completed = history?.status === "COMPLETED";
          const scheduledRound =
            history?.status === "SCHEDULED" &&
            isValidInterviewSchedule(history.scheduledAt);
          const assigned = history?.status === "ASSIGNED";

          let statusText = "Not started";
          if (pendingNext) {
            statusText = "Selected · awaiting schedule";
          } else if (completed) {
            statusText = `Completed · ${formatInterviewResult(history?.result)}`;
            if (history?.nextRound?.name) {
              statusText += ` → ${history.nextRound.name}`;
            }
          } else if (scheduledRound) {
            statusText = `Scheduled · ${safeScheduleLabel(history?.scheduledAt)}`;
          } else if (assigned) {
            statusText = "Assigned · awaiting schedule";
          }

          return (
            <li
              key={key}
              className={cn(
                "rounded-xl border px-3 py-2",
                isCurrent
                  ? "border-[#93C5FD] bg-[#EFF6FF]"
                  : "border-[#E1EBF5] bg-white",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-[#102A56]">
                    Round {round.sortOrder} · {round.name}
                  </p>
                  <p className="text-xs text-[#647A9B]">{statusText}</p>
                  {completed && history?.evaluation?.trim() ? (
                    <p className="mt-1 text-xs text-[#526581]">
                      Feedback: {history.evaluation.trim()}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {isCurrent ? (
                    <Badge variant="info" className={compactBadgeClass}>
                      Current Round
                    </Badge>
                  ) : null}
                  {isNext || pendingNext ? (
                    <Badge variant="default" className={compactBadgeClass}>
                      Next Round
                    </Badge>
                  ) : null}
                  {completed && history?.result ? (
                    <Badge
                      variant={getInterviewResultVariant(history.result)}
                      className={compactBadgeClass}
                    >
                      {formatInterviewResult(history.result)}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
