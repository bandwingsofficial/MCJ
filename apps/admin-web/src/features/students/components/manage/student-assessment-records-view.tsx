"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  StudentAssessmentOverview,
  StudentAssessmentRecord,
} from "@/src/features/students/types/student-assessment.types";
import {
  type AttendanceDatePreset,
  formatAttendanceDisplayDate,
  resolveAttendanceDateRange,
  todayLocalInput,
} from "@/src/features/enrollments/utils/attendance-date.utils";
import { formatBatchLabel } from "@/src/features/branches/utils/branch-display.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Input } from "@/src/shared/components/ui/input";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

const DATE_PRESET_OPTIONS: Array<{
  label: string;
  value: AttendanceDatePreset;
}> = [
  { label: "All Time", value: "ALL_TIME" },
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Custom", value: "CUSTOM" },
];

type AssessmentFilters = {
  search: string;
  batchId: string;
  mode: string;
  batchTimingId: string;
  type: string;
  datePreset: AttendanceDatePreset;
  from: string;
  to: string;
};

const DEFAULT_FILTERS = (): AssessmentFilters => ({
  search: "",
  batchId: "ALL",
  mode: "ALL",
  batchTimingId: "ALL",
  type: "ALL",
  datePreset: "ALL_TIME",
  from: "",
  to: "",
});

function recordDateKey(value: string) {
  return String(value).slice(0, 10);
}

function formatModeLabel(mode?: string | null) {
  if (!mode) return null;
  return mode.charAt(0) + mode.slice(1).toLowerCase();
}

function summarizeFilteredRecords(records: StudentAssessmentRecord[]) {
  if (!records.length) {
    return {
      totalAssessments: 0,
      testCount: 0,
      presentationCount: 0,
      otherCount: 0,
      averagePercentage: 0,
      overallPerformance: 0,
    };
  }

  const testCount = records.filter((record) => record.type === "TEST").length;
  const presentationCount = records.filter(
    (record) => record.type === "PRESENTATION",
  ).length;
  const otherCount = records.length - testCount - presentationCount;
  const averagePercentage =
    Math.round(
      (records.reduce((acc, record) => acc + record.percentage, 0) /
        records.length) *
        10,
    ) / 10;

  return {
    totalAssessments: records.length,
    testCount,
    presentationCount,
    otherCount,
    averagePercentage,
    overallPerformance: averagePercentage,
  };
}

function matchesSearch(record: StudentAssessmentRecord, term: string) {
  if (!term) return true;

  const haystack = [
    record.name,
    record.type,
    record.batch.name,
    record.batch.code,
    record.batchTiming?.name,
    record.batchTiming?.mode,
    record.course?.title,
    record.remarks,
    formatBatchLabel(record.batch.name, record.batch.code),
    formatModeLabel(record.batchTiming?.mode),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

function getPerformanceTone(record: StudentAssessmentRecord) {
  const remarks = record.remarks?.trim().toLowerCase() ?? "";
  if (remarks.includes("absent")) {
    return "absent" as const;
  }
  if (record.percentage >= 75) {
    return "high" as const;
  }
  if (record.percentage >= 50) {
    return "average" as const;
  }
  return "low" as const;
}

const PERFORMANCE_STYLES = {
  high: {
    score: "text-[#15803D]",
    percent: "text-[#15803D]",
    ring: "border-[#BBF7D0] bg-[#F0FDF4]",
  },
  average: {
    score: "text-[#102A56]",
    percent: "text-[#2563EB]",
    ring: "border-[#DBEAFE] bg-[#F8FAFC]",
  },
  low: {
    score: "text-[#C2410C]",
    percent: "text-[#EA580C]",
    ring: "border-[#FED7AA] bg-[#FFF7ED]",
  },
  absent: {
    score: "text-[#DC2626]",
    percent: "text-[#DC2626]",
    ring: "border-[#FECACA] bg-[#FEF2F2]",
  },
} as const;

const TYPE_BADGE_STYLES: Record<string, string> = {
  TEST: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  PRESENTATION: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]",
  ASSIGNMENT: "bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]",
  PRACTICAL: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
  OTHER: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
};

function getTypeBadgeClass(type: string) {
  return TYPE_BADGE_STYLES[type] ?? TYPE_BADGE_STYLES.OTHER;
}

function SummaryStatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#E1EBF5] bg-white px-3 py-2.5 shadow-[0_1px_4px_rgba(16,42,86,0.04)]">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p
        className={`mt-0.5 text-base font-bold leading-tight ${
          accent ? "text-[#2563EB]" : "text-[#102A56]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function AssessmentRecordCard({ record }: { record: StudentAssessmentRecord }) {
  const modeLabel = formatModeLabel(record.batchTiming?.mode);
  const batchLabel = formatBatchLabel(record.batch.name, record.batch.code);
  const contextParts = [
    batchLabel,
    modeLabel,
    record.batchTiming?.name,
    record.course?.title,
  ].filter(Boolean);
  const tone = getPerformanceTone(record);
  const styles = PERFORMANCE_STYLES[tone];
  const remarks = record.remarks?.trim();

  return (
    <div
      className={`rounded-xl border bg-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)] transition-colors hover:shadow-[0_4px_12px_rgba(16,42,86,0.06)] ${styles.ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-tight text-[#102A56]">
            {record.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-[#647A9B]">
            {formatAttendanceDisplayDate(String(record.date))}
          </p>
        </div>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getTypeBadgeClass(record.type)}`}
        >
          {record.type}
        </span>
      </div>

      <p className="mt-1.5 truncate text-[11px] leading-snug text-[#647A9B]">
        {contextParts.join(" · ")}
      </p>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <p className={`text-sm font-semibold tabular-nums ${styles.score}`}>
          {record.obtainedMarks}
          <span className="text-xs font-medium text-[#647A9B]">
            {" "}
            / {record.maxMarks}
          </span>
        </p>
        <p className={`text-lg font-bold tabular-nums leading-none ${styles.percent}`}>
          {record.percentage}%
        </p>
      </div>

      <p className="mt-1.5 truncate text-[11px] leading-snug text-[#647A9B]">
        {remarks ? (
          <>
            {tone === "absent" ? (
              <span className="font-medium text-[#DC2626]">✕ </span>
            ) : (
              <span className="font-medium text-[#15803D]">✓ </span>
            )}
            <span className="text-[#102A56]">{remarks}</span>
          </>
        ) : (
          "—"
        )}
      </p>
    </div>
  );
}

export function StudentAssessmentRecordsView({
  data,
}: {
  data: StudentAssessmentOverview;
}) {
  const [filters, setFilters] = useState<AssessmentFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(filters.search.trim().toLowerCase()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const dateRange = useMemo(
    () =>
      resolveAttendanceDateRange(filters.datePreset, filters.from, filters.to),
    [filters.datePreset, filters.from, filters.to],
  );

  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const record of data.records) {
      map.set(
        record.batch.id,
        formatBatchLabel(record.batch.name, record.batch.code),
      );
    }
    return [
      { label: "All Batches", value: "ALL" },
      ...Array.from(map.entries()).map(([value, label]) => ({ label, value })),
    ];
  }, [data.records]);

  const modeOptions = useMemo(() => {
    const modes = new Set<string>();
    for (const record of data.records) {
      if (record.batchTiming?.mode) {
        modes.add(record.batchTiming.mode);
      }
    }
    return [
      { label: "All Modes", value: "ALL" },
      ...Array.from(modes).map((mode) => ({
        label: formatModeLabel(mode) ?? mode,
        value: mode,
      })),
    ];
  }, [data.records]);

  const timingOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const record of data.records) {
      if (!record.batchTiming) continue;
      if (filters.batchId !== "ALL" && record.batch.id !== filters.batchId) {
        continue;
      }
      if (filters.mode !== "ALL" && record.batchTiming.mode !== filters.mode) {
        continue;
      }
      map.set(record.batchTiming.id, record.batchTiming.name);
    }
    return [
      { label: "All Timings", value: "ALL" },
      ...Array.from(map.entries()).map(([value, label]) => ({ label, value })),
    ];
  }, [data.records, filters.batchId, filters.mode]);

  const typeOptions = useMemo(() => {
    const types = new Set(data.records.map((record) => record.type));
    return [
      { label: "All Types", value: "ALL" },
      ...Array.from(types)
        .sort()
        .map((type) => ({ label: type, value: type })),
    ];
  }, [data.records]);

  const filteredRecords = useMemo(() => {
    return data.records.filter((record) => {
      if (!matchesSearch(record, debouncedSearch)) return false;
      if (filters.batchId !== "ALL" && record.batch.id !== filters.batchId) {
        return false;
      }
      if (
        filters.mode !== "ALL" &&
        record.batchTiming?.mode !== filters.mode
      ) {
        return false;
      }
      if (
        filters.batchTimingId !== "ALL" &&
        record.batchTiming?.id !== filters.batchTimingId
      ) {
        return false;
      }
      if (filters.type !== "ALL" && record.type !== filters.type) {
        return false;
      }

      const recordDate = recordDateKey(record.date);
      if (dateRange.from && recordDate < dateRange.from) return false;
      if (dateRange.to && recordDate > dateRange.to) return false;

      return true;
    });
  }, [data.records, debouncedSearch, filters, dateRange.from, dateRange.to]);

  const summary = useMemo(
    () => summarizeFilteredRecords(filteredRecords),
    [filteredRecords],
  );

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.batchId !== "ALL" ||
    filters.mode !== "ALL" ||
    filters.batchTimingId !== "ALL" ||
    filters.type !== "ALL" ||
    filters.datePreset !== "ALL_TIME";

  const updateFilters = (patch: Partial<AssessmentFilters>) => {
    setFilters((current) => {
      const next = { ...current, ...patch };
      if (patch.batchId && patch.batchId !== current.batchId) {
        next.batchTimingId = "ALL";
      }
      if (patch.mode && patch.mode !== current.mode) {
        next.batchTimingId = "ALL";
      }
      return next;
    });
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS());

  if (!data.records.length) {
    return (
      <EmptyState title="No assessment records found for this student's current enrollments." />
    );
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3 rounded-xl border border-[#E1EBF5] bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#102A56]">
            Filter Assessment Records
          </h2>
          <p className="text-xs font-medium text-[#647A9B]">
            {filteredRecords.length} of {data.records.length} results
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          <SearchInput
            value={filters.search}
            placeholder="Search assessment / student..."
            className="h-[46px] rounded-xl"
            onChange={(value) => updateFilters({ search: value })}
          />
          <AppSelect
            value={filters.batchId}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => updateFilters({ batchId: value })}
            options={batchOptions}
          />
          <AppSelect
            value={filters.mode}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => updateFilters({ mode: value })}
            options={modeOptions}
          />
          <AppSelect
            value={filters.batchTimingId}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => updateFilters({ batchTimingId: value })}
            options={timingOptions}
          />
          <AppSelect
            value={filters.type}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => updateFilters({ type: value })}
            options={typeOptions}
          />
          <AppSelect
            value={filters.datePreset}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => {
              const preset = value as AttendanceDatePreset;
              if (preset !== "CUSTOM") {
                updateFilters({ datePreset: preset, from: "", to: "" });
                return;
              }
              const today = todayLocalInput();
              updateFilters({
                datePreset: preset,
                from: filters.from || today,
                to: filters.to || today,
              });
            }}
            options={DATE_PRESET_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Input
            type="date"
            className="h-[46px] rounded-xl"
            value={
              filters.datePreset === "CUSTOM"
                ? filters.from
                : (dateRange.from ?? "")
            }
            disabled={filters.datePreset !== "CUSTOM"}
            onChange={(event) => updateFilters({ from: event.target.value })}
          />
          <Input
            type="date"
            className="h-[46px] rounded-xl"
            value={
              filters.datePreset === "CUSTOM"
                ? filters.to
                : (dateRange.to ?? "")
            }
            disabled={filters.datePreset !== "CUSTOM"}
            onChange={(event) => updateFilters({ to: event.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            className="h-[46px] rounded-xl sm:col-span-2 xl:col-span-1"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryStatCard
          label="Total Assessments"
          value={String(summary.totalAssessments)}
        />
        <SummaryStatCard label="Tests" value={String(summary.testCount)} />
        <SummaryStatCard
          label="Presentations"
          value={String(summary.presentationCount)}
        />
        <SummaryStatCard
          label="Other Types"
          value={String(summary.otherCount)}
        />
        <SummaryStatCard
          label="Average Percentage"
          value={
            summary.totalAssessments > 0
              ? `${summary.averagePercentage}%`
              : "—"
          }
        />
        <SummaryStatCard
          label="Overall Performance"
          value={
            summary.totalAssessments > 0
              ? `${summary.overallPerformance}%`
              : "—"
          }
          accent
        />
      </div>

      {filteredRecords.length ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => (
            <AssessmentRecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <EmptyState title="No assessments match the selected filters." />
      )}
    </div>
  );
}
