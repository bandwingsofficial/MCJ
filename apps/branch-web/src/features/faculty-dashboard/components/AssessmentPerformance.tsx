"use client";

import { formatBatchStatus } from "@/src/features/branch-ops/utils/batch-display";

import type { FacultyAssessmentPerformance } from "../types/facultyDashboard.types";
import { DASHBOARD_ROUTES } from "../constants";
import {
  DashboardEmptyState,
  DashboardSection,
} from "./DashboardSection";

interface Props {
  performance?: FacultyAssessmentPerformance | null;
}

export function AssessmentPerformance({ performance }: Props) {
  const byType = (performance?.byType ?? []).filter((item) => item.count > 0);

  return (
    <DashboardSection
      title="Assessment Performance"
      viewAllHref={DASHBOARD_ROUTES.assessments}
    >
      {!performance ? (
        <DashboardEmptyState message="Unable to load assessment data." />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-lg border border-[#E8EEF5] bg-[#F8FBFF] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Average Score
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[#102A56]">
                {performance.averagePercentage
                  ? `${performance.averagePercentage}%`
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-[#E8EEF5] bg-[#F8FBFF] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Students Assessed
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[#102A56]">
                {performance.studentsAssessed}
              </p>
            </div>
          </div>

          {!byType.length ? (
            <DashboardEmptyState message="No assessment records for this period." />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {byType.map((item) => (
                <li
                  key={item.type}
                  className="flex items-center justify-between rounded-lg border border-[#E8EEF5] bg-[#F8FBFF] px-3 py-2.5"
                >
                  <span className="truncate text-sm font-medium text-[#647A9B]">
                    {formatBatchStatus(item.type)}
                  </span>
                  <span className="ml-2 shrink-0 text-sm font-bold tabular-nums text-[#102A56]">
                    {item.averagePercentage != null
                      ? `${item.averagePercentage}%`
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </DashboardSection>
  );
}
