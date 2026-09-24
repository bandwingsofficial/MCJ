"use client";

import type { InterviewRoundOption } from "@/src/features/branch-ops/types";
import { cn } from "@/src/shared/lib/cn";

export type InterviewRoundTab = "ALL" | string;

interface Props {
  rounds: InterviewRoundOption[];
  roundCounts: Array<{ roundId: string; count: number }>;
  totalCount: number;
  activeRoundId: InterviewRoundTab;
  disabled?: boolean;
  onChange: (roundId: InterviewRoundTab) => void;
}

export function BranchInterviewRoundTabs({
  rounds,
  roundCounts,
  totalCount,
  activeRoundId,
  disabled = false,
  onChange,
}: Props) {
  const countByRound = new Map(
    roundCounts.map((entry) => [entry.roundId, entry.count]),
  );

  const tabs: Array<{ id: InterviewRoundTab; label: string; count: number }> = [
    { id: "ALL", label: "All", count: totalCount },
    ...rounds.map((round) => ({
      id: round.id,
      label: round.name,
      count: countByRound.get(round.id) ?? 0,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = activeRoundId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#DCE8F5] bg-white text-[#526581] hover:bg-[#F8FBFF]",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                active ? "bg-white text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#647A9B]",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
