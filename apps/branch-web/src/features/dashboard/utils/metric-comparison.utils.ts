import type { DashboardMetric } from "@/src/features/dashboard/types/branch-dashboard.types";
import {
  formatCount,
  formatInr,
} from "@/src/features/dashboard/utils/dashboard-date.utils";

export function formatMetricComparisonLabel(
  metric: DashboardMetric,
  format: "count" | "currency",
): string | undefined {
  const comparison = metric.comparison;
  if (!comparison) return undefined;

  const { previousValue, delta, deltaPercent } = comparison;
  const current = metric.value;

  if (previousValue === 0 && current > 0) {
    return "New this period";
  }

  if (previousValue === 0 && current === 0) {
    return "No previous data";
  }

  if (delta === 0) {
    return "Same as previous period";
  }

  const sign = delta > 0 ? "+" : "-";
  const absDelta = Math.abs(delta);

  if (
    deltaPercent != null &&
    Number.isFinite(deltaPercent) &&
    previousValue > 0
  ) {
    const pctLabel =
      deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`;
    if (format === "currency") {
      return `${pctLabel} (${sign}${formatInr(absDelta)}) vs previous period`;
    }
    return `${pctLabel} (${sign}${formatCount(absDelta)}) vs previous period`;
  }

  if (format === "currency") {
    return `${delta > 0 ? "+" : "-"}${formatInr(absDelta)} vs previous period`;
  }

  return `${delta > 0 ? "+" : ""}${formatCount(delta)} vs previous period`;
}

export function comparisonToneClass(metric: DashboardMetric): string {
  const comparison = metric.comparison;
  if (!comparison) return "text-[#647A9B]";

  if (comparison.previousValue === 0 && metric.value === 0) {
    return "text-[#647A9B]";
  }

  if (comparison.delta > 0) return "text-emerald-700";
  if (comparison.delta < 0) return "text-rose-700";
  return "text-[#647A9B]";
}
