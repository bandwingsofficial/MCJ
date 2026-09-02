"use client";

import type { FacultyAttendanceTrendPoint } from "../types/facultyDashboard.types";
import { DASHBOARD_COLORS } from "../constants";

interface Props {
  data: FacultyAttendanceTrendPoint[];
}

export function AttendanceChart({ data }: Props) {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-[#647A9B]">
        No attendance records for this period.
      </p>
    );
  }

  const width = 560;
  const height = 180;
  const padding = { top: 16, right: 12, bottom: 28, left: 32 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => [point.present, point.absent, point.late]),
  );

  const step = innerWidth / Math.max(data.length - 1, 1);
  const barGroupWidth = Math.min(
    innerWidth / data.length - 4,
    data.length <= 3 ? 48 : 28,
  );
  const barWidth = Math.max(4, (barGroupWidth - 4) / 3);

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Attendance trend chart"
      >
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + innerHeight * (1 - ratio);
          return (
            <line
              key={ratio}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#E8EEF5"
              strokeWidth={1}
            />
          );
        })}

        {data.map((point, index) => {
          const groupX =
            data.length === 1
              ? padding.left + innerWidth / 2 - barGroupWidth / 2
              : padding.left + index * step - barGroupWidth / 2;
          const groups = [
            { key: "present", value: point.present, fill: DASHBOARD_COLORS.present },
            { key: "absent", value: point.absent, fill: DASHBOARD_COLORS.absent },
            { key: "late", value: point.late, fill: DASHBOARD_COLORS.late },
          ] as const;

          return (
            <g key={point.date}>
              {groups.map((group, groupIndex) => {
                const barHeight =
                  (group.value / maxValue) * innerHeight || 0;
                const bx = groupX + groupIndex * (barWidth + 2);
                const by = padding.top + innerHeight - barHeight;
                return (
                  <rect
                    key={group.key}
                    x={bx}
                    y={by}
                    width={barWidth}
                    height={barHeight}
                    rx={3}
                    fill={group.fill}
                    opacity={0.9}
                  />
                );
              })}
              <text
                x={groupX + barGroupWidth / 2}
                y={height - 8}
                textAnchor="middle"
                className="fill-[#647A9B] text-[9px]"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#647A9B]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: DASHBOARD_COLORS.present }}
          />
          Present
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: DASHBOARD_COLORS.absent }}
          />
          Absent
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: DASHBOARD_COLORS.late }}
          />
          Late
        </span>
      </div>
    </div>
  );
}
