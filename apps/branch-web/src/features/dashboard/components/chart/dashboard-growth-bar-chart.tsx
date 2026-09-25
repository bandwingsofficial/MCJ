"use client";

import { useMemo, useState } from "react";

import {
  type ChartPoint,
  formatAxisDate,
  isChartEmpty,
  pickLabelIndexes,
} from "@/src/features/dashboard/components/chart/chart-utils";
import { ChartTooltip } from "@/src/features/dashboard/components/chart/chart-tooltip";

interface Props {
  data: ChartPoint[];
  legendLabel: string;
  barColor?: string;
  barGradientFrom?: string;
  valueFormatter?: (value: number) => string;
  emptyLabel?: string;
  yAxisLabel?: string;
}

export function DashboardGrowthBarChart({
  data,
  legendLabel,
  barColor = "#7C3AED",
  barGradientFrom = "#A78BFA",
  valueFormatter = (v) => String(v),
  emptyLabel = "No data for this period.",
  yAxisLabel = "Count",
}: Props) {
  const [hover, setHover] = useState<{
    px: number;
    py: number;
    label: string;
    value: number;
  } | null>(null);

  const layout = useMemo(() => {
    const width = 640;
    const height = 210;
    const padding = { top: 16, right: 12, bottom: 34, left: 44 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(1, ...data.map((point) => point.value));
    const barGap = 4;
    const barWidth = Math.max(
      8,
      innerWidth / Math.max(data.length, 1) - barGap,
    );

    const bars = data.map((point, index) => {
      const barHeight = (point.value / maxValue) * innerHeight;
      const x =
        padding.left +
        index * (barWidth + barGap) +
        (innerWidth - data.length * (barWidth + barGap) + barGap) / 2;
      const y = padding.top + innerHeight - barHeight;
      return { x, y, barWidth, barHeight, ...point };
    });

    const yTicks = [0, 0.5, 1].map((ratio) => ({
      y: padding.top + innerHeight * (1 - ratio),
      value: Math.round(maxValue * ratio),
    }));

    return {
      width,
      height,
      padding,
      innerHeight,
      bars,
      yTicks,
      labelIndexes: pickLabelIndexes(data.length),
      gradientId: `barGrad-${barColor.replace("#", "")}`,
    };
  }, [data, barColor]);

  if (isChartEmpty(data)) {
    return (
      <p className="py-10 text-center text-sm text-[#647A9B]">{emptyLabel}</p>
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#647A9B]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: barColor }}
          />
          {legendLabel}
        </span>
        <span className="uppercase tracking-wide">{yAxisLabel}</span>
      </div>
      <div className="relative rounded-xl bg-gradient-to-b from-white/50 to-transparent p-1">
        <ChartTooltip
          visible={Boolean(hover)}
          x={hover ? `${hover.px}%` : "0%"}
          y={hover ? `${hover.py}%` : "0%"}
          title={hover ? formatAxisDate(hover.label) : ""}
          value={hover ? valueFormatter(hover.value) : ""}
          usePercent
        />
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="w-full"
          role="img"
          aria-label={`${legendLabel} bar chart`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={layout.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={barGradientFrom} />
              <stop offset="100%" stopColor={barColor} />
            </linearGradient>
          </defs>

          {layout.yTicks.map((tick) => (
            <g key={tick.y}>
              <line
                x1={layout.padding.left}
                y1={tick.y}
                x2={layout.width - layout.padding.right}
                y2={tick.y}
                stroke="#E8EEF5"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={layout.padding.left - 6}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-[#94A3B8] text-[9px]"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {layout.bars.map((bar, index) => (
            <g key={`${bar.label}-${index}`}>
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.barWidth}
                height={Math.max(bar.barHeight, bar.value > 0 ? 3 : 0)}
                rx={4}
                fill={`url(#${layout.gradientId})`}
                opacity={hover && hover.label !== bar.label ? 0.55 : 1}
                onMouseEnter={() =>
                  setHover({
                    px: ((bar.x + bar.barWidth / 2) / layout.width) * 100,
                    py: (bar.y / layout.height) * 100,
                    label: bar.label,
                    value: bar.value,
                  })
                }
              />
              <title>{`${formatAxisDate(bar.label)}: ${valueFormatter(bar.value)}`}</title>
            </g>
          ))}

          {layout.bars.map((bar, index) =>
            layout.labelIndexes.has(index) ? (
              <text
                key={`label-${bar.label}`}
                x={bar.x + bar.barWidth / 2}
                y={layout.height - 8}
                textAnchor="middle"
                className="fill-[#647A9B] text-[9px]"
              >
                {formatAxisDate(bar.label)}
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  );
}
