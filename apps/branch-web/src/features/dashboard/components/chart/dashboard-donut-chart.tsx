"use client";

import { useMemo, useState } from "react";

import { CHART_PALETTE } from "@/src/features/dashboard/components/chart/chart-utils";

export interface DonutSegment {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  segments: DonutSegment[];
  centerLabel?: string;
  emptyLabel?: string;
}

export function DashboardDonutChart({
  segments,
  centerLabel = "Total",
  emptyLabel = "No distribution data yet.",
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chart = useMemo(() => {
    const filtered = segments.filter((segment) => segment.value > 0);
    const total = filtered.reduce((sum, segment) => sum + segment.value, 0);
    if (total === 0) return null;

    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 72;
    const stroke = 22;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;
    const arcs = filtered.map((segment, index) => {
      const fraction = segment.value / total;
      const length = fraction * circumference;
      const dasharray = `${length} ${circumference - length}`;
      const dashoffset = -offset;
      offset += length;
      const color =
        segment.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
      return { ...segment, dasharray, dashoffset, color, fraction, index };
    });

    return { size, cx, cy, radius, stroke, circumference, arcs, total };
  }, [segments]);

  if (!chart) {
    return (
      <p className="py-8 text-center text-sm text-[#647A9B]">{emptyLabel}</p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
      <div className="relative">
        <svg
          width={chart.size}
          height={chart.size}
          viewBox={`0 0 ${chart.size} ${chart.size}`}
          className="-rotate-90"
          role="img"
          aria-label="Mode distribution donut chart"
        >
          <circle
            cx={chart.cx}
            cy={chart.cy}
            r={chart.radius}
            fill="none"
            stroke="#EEF2F8"
            strokeWidth={chart.stroke}
          />
          {chart.arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={chart.cx}
              cy={chart.cy}
              r={chart.radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={chart.stroke}
              strokeDasharray={arc.dasharray}
              strokeDashoffset={arc.dashoffset}
              strokeLinecap="round"
              opacity={
                activeIndex === null || activeIndex === arc.index ? 1 : 0.35
              }
              onMouseEnter={() => setActiveIndex(arc.index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <title>{`${arc.label}: ${arc.value} (${Math.round(arc.fraction * 100)}%)`}</title>
            </circle>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
            {centerLabel}
          </p>
          <p className="text-xl font-bold tabular-nums text-[#102A56]">
            {chart.total}
          </p>
        </div>
      </div>

      <ul className="w-full min-w-[180px] space-y-2 sm:w-auto">
        {chart.arcs.map((arc) => (
          <li
            key={arc.label}
            className="flex items-center justify-between gap-3 text-xs"
            onMouseEnter={() => setActiveIndex(arc.index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: arc.color }}
              />
              <span className="truncate font-medium text-[#102A56]">
                {arc.label}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-[#647A9B]">
              {arc.value}{" "}
              <span className="text-[#94A3B8]">
                ({Math.round(arc.fraction * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
