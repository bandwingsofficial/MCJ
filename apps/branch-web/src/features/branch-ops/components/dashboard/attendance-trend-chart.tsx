"use client";

import type { FacultyAttendanceTrendPoint } from "@/src/features/branch-ops/types";

interface Props {
  data: FacultyAttendanceTrendPoint[];
}

export function AttendanceTrendChart({ data }: Props) {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-[#647A9B]">
        No attendance data for this period.
      </p>
    );
  }

  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => [point.present, point.absent, point.late]),
  );
  const width = 640;
  const height = 200;
  const padding = { top: 12, right: 12, bottom: 28, left: 12 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const step = innerWidth / Math.max(data.length, 1);
  const barWidth = Math.min(18, step * 0.22);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[320px] w-full"
        role="img"
        aria-label="Attendance trend chart"
      >
        {data.map((point, index) => {
          const x =
            padding.left + index * step + (step - barWidth * 3 - 4) / 2;
          const groups = [
            { key: "present", value: point.present, fill: "#16A34A" },
            { key: "absent", value: point.absent, fill: "#DC2626" },
            { key: "late", value: point.late, fill: "#D97706" },
          ] as const;

          return (
            <g key={point.date}>
              {groups.map((group, groupIndex) => {
                const barHeight =
                  (group.value / maxValue) * innerHeight || 0;
                const bx = x + groupIndex * (barWidth + 2);
                const by = padding.top + innerHeight - barHeight;
                return (
                  <rect
                    key={group.key}
                    x={bx}
                    y={by}
                    width={barWidth}
                    height={barHeight}
                    rx={2}
                    fill={group.fill}
                  />
                );
              })}
              <text
                x={x + (barWidth * 3 + 4) / 2}
                y={height - 6}
                textAnchor="middle"
                className="fill-[#647A9B] text-[10px]"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#647A9B]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#16A34A]" /> Present
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#DC2626]" /> Absent
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#D97706]" /> Late
        </span>
      </div>
    </div>
  );
}
