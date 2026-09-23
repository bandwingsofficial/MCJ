"use client";

import { useMemo, useState } from "react";

import {
  type ChartPoint,
  formatAxisDate,
  isChartEmpty,
  pickLabelIndexes,
  smoothLinePath,
} from "@/src/features/dashboard/components/chart/chart-utils";
import { ChartTooltip } from "@/src/features/dashboard/components/chart/chart-tooltip";

interface Props {
  data: ChartPoint[];
  valueFormatter?: (value: number) => string;
  emptyLabel?: string;
}

export function DashboardRevenueAreaChart({
  data,
  valueFormatter = (v) => String(v),
  emptyLabel = "No revenue recorded for this period.",
}: Props) {
  const [hover, setHover] = useState<{
    px: number;
    py: number;
    label: string;
    value: number;
  } | null>(null);

  const layout = useMemo(() => {
    const width = 680;
    const height = 220;
    const padding = { top: 20, right: 16, bottom: 36, left: 52 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(1, ...data.map((point) => point.value));
    const step = innerWidth / Math.max(data.length - 1, 1);

    const points = data.map((point, index) => {
      const x =
        data.length === 1
          ? padding.left + innerWidth / 2
          : padding.left + index * step;
      const y =
        padding.top + innerHeight - (point.value / maxValue) * innerHeight;
      return { x, y, ...point };
    });

    const linePath = smoothLinePath(points);
    const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? padding.left} ${
      padding.top + innerHeight
    } L ${points[0]?.x ?? padding.left} ${padding.top + innerHeight} Z`;

    const yTicks = [0, 0.5, 1].map((ratio) => ({
      y: padding.top + innerHeight * (1 - ratio),
      value: maxValue * ratio,
    }));

    return {
      width,
      height,
      padding,
      points,
      linePath,
      areaPath,
      yTicks,
      labelIndexes: pickLabelIndexes(data.length),
    };
  }, [data]);

  if (isChartEmpty(data)) {
    return (
      <p className="py-10 text-center text-sm text-[#647A9B]">{emptyLabel}</p>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs text-[#647A9B]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
          Daily collected revenue
        </span>
      </div>
      <div className="relative rounded-xl bg-gradient-to-b from-[#F8FBFF]/80 to-transparent p-1">
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
          aria-label="Revenue area chart"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="revenueLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
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
                strokeWidth={1}
              />
              <text
                x={layout.padding.left - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-[#94A3B8] text-[9px]"
              >
                {valueFormatter(tick.value)}
              </text>
            </g>
          ))}

          <path d={layout.areaPath} fill="url(#revenueAreaGradient)" />
          <path
            d={layout.linePath}
            fill="none"
            stroke="url(#revenueLineGradient)"
            strokeWidth={2.75}
            strokeLinecap="round"
          />

          {layout.points.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={12}
                fill="transparent"
                onMouseEnter={() =>
                  setHover({
                    px: (point.x / layout.width) * 100,
                    py: (point.y / layout.height) * 100,
                    label: point.label,
                    value: point.value,
                  })
                }
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={hover?.label === point.label ? 5 : 3.5}
                fill="#2563EB"
                stroke="#fff"
                strokeWidth={1.5}
              />
              <title>{`${formatAxisDate(point.label)}: ${valueFormatter(point.value)}`}</title>
            </g>
          ))}

          {layout.points.map((point, index) =>
            layout.labelIndexes.has(index) ? (
              <text
                key={`x-${point.label}`}
                x={point.x}
                y={layout.height - 10}
                textAnchor="middle"
                className="fill-[#647A9B] text-[10px]"
              >
                {formatAxisDate(point.label)}
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  );
}
