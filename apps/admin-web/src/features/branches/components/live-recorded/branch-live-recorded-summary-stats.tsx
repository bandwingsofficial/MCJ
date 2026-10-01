"use client";

import { BookOpen, Layers, Radio } from "lucide-react";

interface Props {
  moduleCount: number;
  lessonCount: number;
  liveVideoCount: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Layers;
}) {
  return (
    <div className="rounded-xl border border-[#E1EBF5] bg-white px-4 py-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            {label}
          </p>
          <p className="text-xl font-semibold tabular-nums text-[#102A56]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BranchLiveRecordedSummaryStats({
  moduleCount,
  lessonCount,
  liveVideoCount,
}: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard label="Modules" value={moduleCount} icon={Layers} />
      <StatCard label="Lessons" value={lessonCount} icon={BookOpen} />
      <StatCard label="Live Recorded Videos" value={liveVideoCount} icon={Radio} />
    </div>
  );
}
