"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, ListFilter, Plus, Settings2 } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { getAssessmentTypeBadgeClass } from "@/src/features/branch-ops/constants/assessment.constants";
import { AddAssessmentModal } from "@/src/features/branch-ops/components/assessment/add-assessment-modal";
import { AssessmentBatchOverview } from "@/src/features/branch-ops/components/assessment/assessment-batch-overview";
import { AssessmentProgressPanel } from "@/src/features/branch-ops/components/assessment/assessment-progress-panel";
import { AssessmentSessionOverview } from "@/src/features/branch-ops/components/assessment/assessment-session-overview";
import { defaultAttendanceDateRangeFilters } from "@/src/features/branch-ops/components/attendance/attendance-date-range-filters";
import type {
  AssessmentItem,
  AssessmentReportItem,
} from "@/src/features/branch-ops/types";
import {
  type AttendanceDatePreset,
  formatAttendanceDisplayDate,
  resolveAttendanceDateRange,
  todayLocalInput,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import {
  BATCH_MODE_SECTION_LABELS,
  type BatchMode,
  getBatchModeSectionLabel,
  getConfiguredBatchModes,
  getTimingsForMode,
} from "@/src/features/branch-ops/utils/batch-mode.utils";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Button } from "@/src/shared/components/ui/button";
import { CategoryPagination } from "@/src/shared/components/ui/category-pagination";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Input } from "@/src/shared/components/ui/input";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";
import { cn } from "@/src/shared/lib/cn";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

const ASSESSMENT_TYPES = [
  { label: "All Types", value: "ALL" },
  { label: "TEST", value: "TEST" },
  { label: "PRESENTATION", value: "PRESENTATION" },
  { label: "ASSIGNMENT", value: "ASSIGNMENT" },
  { label: "PRACTICAL", value: "PRACTICAL" },
  { label: "OTHER", value: "OTHER" },
];

const MODE_OPTIONS: Array<{ label: string; value: BatchMode }> = [
  { label: BATCH_MODE_SECTION_LABELS.OFFLINE, value: "OFFLINE" },
  { label: BATCH_MODE_SECTION_LABELS.ONLINE, value: "ONLINE" },
  { label: BATCH_MODE_SECTION_LABELS.RECORDED, value: "RECORDED" },
];

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const FILTER_TRIGGER =
  "h-9 rounded-lg px-2.5 text-sm w-full min-w-0 [&>span]:line-clamp-1 [&>span]:text-left";

const DATE_PRESET_ROW_BUTTONS: Array<{
  label: string;
  preset: AttendanceDatePreset;
}> = [
  { label: "1D", preset: "TODAY" },
  { label: "7D", preset: "THIS_WEEK" },
  { label: "1M", preset: "THIS_MONTH" },
];

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

const COLUMN_COUNT = 9;

type Filters = {
  search: string;
  batchId: string;
  mode: string;
  batchTimingId: string;
  type: string;
  datePreset: AttendanceDatePreset;
  from: string;
  to: string;
};

const defaultFilters = (): Filters => ({
  search: "",
  batchId: "ALL",
  mode: "ALL",
  batchTimingId: "ALL",
  type: "ALL",
  ...defaultAttendanceDateRangeFilters(),
});

function groupAssessmentItemsToReport(
  items: AssessmentItem[],
): AssessmentReportItem[] {
  const map = new Map<string, AssessmentItem[]>();

  for (const item of items) {
    const key =
      item.assessmentGroupId ??
      `legacy:${item.id}:${item.type}:${item.name}:${String(item.date)}:${item.maxMarks}`;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }

  return Array.from(map.values()).map((rows) => {
    const first = rows[0];
    const obtained = rows.map((row) => row.obtainedMarks);
    const sum = obtained.reduce((acc, value) => acc + value, 0);
    const percentages = rows.map((row) => row.percentage);
    const averageMarks = Math.round((sum / rows.length) * 100) / 100;
    const averagePercentage =
      Math.round(
        (percentages.reduce((acc, value) => acc + value, 0) / percentages.length) *
          10,
      ) / 10;

    return {
      id: first.assessmentGroupId ?? first.id,
      assessmentGroupId: first.assessmentGroupId,
      type: first.type,
      name: first.name,
      date: String(first.date),
      maxMarks: first.maxMarks,
      batch: first.batch,
      course: first.course,
      session: first.session,
      faculty: first.faculty,
      studentCount: rows.length,
      averageMarks,
      averagePercentage,
      summary: {
        totalAssessments: rows.length,
        marksEntered: rows.length,
        averageMarks,
        averagePercentage,
        highestMarks: Math.max(...obtained),
        lowestMarks: Math.min(...obtained),
      },
    };
  });
}

export function AssessmentsModulePage() {
  const role = useAuthStore((state) => state.user?.role);
  const [tab, setTab] = useState("records");
  const [addOpen, setAddOpen] = useState(false);
  const [editAssessmentId, setEditAssessmentId] = useState<string | null>(null);
  const [progressReloadKey, setProgressReloadKey] = useState(0);

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [moreFiltersDraft, setMoreFiltersDraft] = useState({
    type: "ALL",
    from: "",
    to: "",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const dateRange = useMemo(
    () =>
      resolveAttendanceDateRange(filters.datePreset, filters.from, filters.to),
    [filters.datePreset, filters.from, filters.to],
  );

  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);
  const batches = batchesQuery.data ?? [];

  const selectedBatch = useMemo(
    () =>
      filters.batchId === "ALL"
        ? null
        : (batches.find((batch) => batch.id === filters.batchId) ?? null),
    [batches, filters.batchId],
  );

  const modeOptions = useMemo(() => {
    const options = [{ label: "All Modes", value: "ALL" }];
    const modes =
      selectedBatch != null
        ? getConfiguredBatchModes(selectedBatch)
        : MODE_OPTIONS.map((option) => option.value);

    for (const mode of modes) {
      options.push({
        label: getBatchModeSectionLabel(mode),
        value: mode,
      });
    }

    return options;
  }, [selectedBatch]);

  const timingOptions = useMemo(() => {
    const options = [{ label: "All Timings", value: "ALL" }];

    if (
      selectedBatch &&
      (filters.mode === "OFFLINE" ||
        filters.mode === "ONLINE" ||
        filters.mode === "RECORDED")
    ) {
      for (const timing of getTimingsForMode(selectedBatch, filters.mode)) {
        options.push({ label: timing.name, value: timing.id });
      }
    }

    return options;
  }, [selectedBatch, filters.mode]);

  const useTimingScope =
    filters.batchId !== "ALL" &&
    (filters.mode !== "ALL" || filters.batchTimingId !== "ALL");

  const enrollmentsQuery = useAsyncData(
    () =>
      useTimingScope
        ? branchOpsApi.enrollments({
            batchId: filters.batchId,
            take: 500,
          })
        : Promise.resolve(null),
    [useTimingScope, filters.batchId],
  );

  const timingStudentIds = useMemo(() => {
    if (!useTimingScope || !enrollmentsQuery.data) {
      return null;
    }

    const ids = new Set<string>();

    for (const enrollment of enrollmentsQuery.data.items) {
      if (filters.batchTimingId !== "ALL") {
        if (enrollment.batchTiming?.id === filters.batchTimingId) {
          ids.add(enrollment.student.id);
        }
        continue;
      }

      if (
        filters.mode !== "ALL" &&
        enrollment.batchTiming?.mode === filters.mode
      ) {
        ids.add(enrollment.student.id);
      }
    }

    return ids;
  }, [
    useTimingScope,
    enrollmentsQuery.data,
    filters.batchTimingId,
    filters.mode,
  ]);

  const sharedQueryParams = useMemo(
    () => ({
      batchId: filters.batchId === "ALL" ? undefined : filters.batchId,
      type: filters.type === "ALL" ? undefined : filters.type,
      search: debouncedSearch || undefined,
      from: dateRange.from,
      to: dateRange.to,
    }),
    [
      filters.batchId,
      filters.type,
      debouncedSearch,
      dateRange.from,
      dateRange.to,
    ],
  );

  const reportParams = useMemo(
    () => ({
      ...sharedQueryParams,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    [sharedQueryParams, page, pageSize],
  );

  const reportQuery = useAsyncData(
    () =>
      useTimingScope
        ? Promise.resolve({ items: [], total: 0 })
        : branchOpsApi.assessmentReport(reportParams),
    [
      useTimingScope,
      reportParams.batchId,
      reportParams.type,
      reportParams.search,
      reportParams.from,
      reportParams.to,
      reportParams.skip,
      reportParams.take,
    ],
  );

  const scopedReportQuery = useAsyncData(
    async () => {
      if (!useTimingScope || timingStudentIds == null) {
        return { items: [], total: 0 };
      }

      const records = await branchOpsApi.assessmentList(sharedQueryParams);
      const filtered = records.filter((record) =>
        timingStudentIds.has(record.student.id),
      );
      const grouped = groupAssessmentItemsToReport(filtered).sort((left, right) =>
        right.date.localeCompare(left.date),
      );
      const skip = (page - 1) * pageSize;

      return {
        items: grouped.slice(skip, skip + pageSize),
        total: grouped.length,
      };
    },
    [
      useTimingScope,
      timingStudentIds,
      sharedQueryParams.batchId,
      sharedQueryParams.type,
      sharedQueryParams.search,
      sharedQueryParams.from,
      sharedQueryParams.to,
      page,
      pageSize,
    ],
  );

  const activeReportQuery = useTimingScope ? scopedReportQuery : reportQuery;

  const items = activeReportQuery.data?.items ?? [];
  const total = activeReportQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const recordsLoading =
    (useTimingScope && enrollmentsQuery.loading && !enrollmentsQuery.data) ||
    (activeReportQuery.loading && !activeReportQuery.data);

  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const openMoreFilters = () => {
    const resolved = resolveAttendanceDateRange(
      filters.datePreset,
      filters.from,
      filters.to,
    );
    const today = todayLocalInput();

    setMoreFiltersDraft({
      type: filters.type,
      from:
        filters.datePreset === "CUSTOM"
          ? filters.from || today
          : resolved.from || today,
      to:
        filters.datePreset === "CUSTOM"
          ? filters.to || today
          : resolved.to || today,
    });
    setMoreFiltersOpen(true);
  };

  const applyMoreFilters = () => {
    const today = todayLocalInput();

    updateFilters({
      type: moreFiltersDraft.type,
      datePreset: "CUSTOM",
      from: moreFiltersDraft.from || today,
      to: moreFiltersDraft.to || today,
    });
    setMoreFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters(defaultFilters());
    setDebouncedSearch("");
    setPage(1);
  };

  const selectDatePreset = (preset: AttendanceDatePreset) => {
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
  };

  const reloadRecords = () => {
    void reportQuery.reload();
    void scopedReportQuery.reload();
  };

  const showDateFilters = tab === "records";

  if (batchesQuery.loading && !batchesQuery.data) {
    return <Loader />;
  }

  if (batchesQuery.error) {
    return (
      <ErrorState
        description={batchesQuery.error}
        onRetry={batchesQuery.reload}
      />
    );
  }

  return (
    <div className="space-y-3">
      <header className="px-1 py-1">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between xl:gap-3">
          <div className="min-w-0 shrink-0 space-y-1">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs"
            >
              <Link
                href="/dashboard"
                className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
              >
                {formatRoleLabel(role) || "Branch"}
              </Link>
              <ChevronRight
                className="h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
              <span aria-current="page" className="font-medium text-[#102A56]">
                Assessments
              </span>
            </nav>

            <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
              Assessments
            </h1>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 xl:flex-nowrap">
            <div className="w-full min-w-[180px] sm:w-[200px] xl:w-[220px]">
              <SearchInput
                value={filters.search}
                placeholder="Search student name/code..."
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, search: value }))
                }
              />
            </div>

            <div className="w-full min-w-[140px] sm:w-[150px] xl:w-[160px]">
              <AppSelect
                value={filters.batchId}
                triggerClassName={FILTER_TRIGGER}
                onValueChange={(value) =>
                  updateFilters({
                    batchId: value,
                    mode: "ALL",
                    batchTimingId: "ALL",
                  })
                }
                options={[
                  { label: "All Batches", value: "ALL" },
                  ...batches.map((batch) => ({
                    label: `${batch.name} (${batch.code})`,
                    value: batch.id,
                  })),
                ]}
              />
            </div>

            <div className="w-full min-w-[120px] sm:w-[130px] xl:w-[140px]">
              <AppSelect
                value={filters.mode}
                triggerClassName={FILTER_TRIGGER}
                onValueChange={(value) =>
                  updateFilters({ mode: value, batchTimingId: "ALL" })
                }
                options={modeOptions}
              />
            </div>

            <div className="w-full min-w-[120px] sm:w-[130px] xl:w-[140px]">
              <AppSelect
                value={filters.batchTimingId}
                triggerClassName={FILTER_TRIGGER}
                onValueChange={(value) =>
                  updateFilters({ batchTimingId: value })
                }
                options={timingOptions}
                disabled={
                  filters.batchId === "ALL" ||
                  filters.mode === "ALL" ||
                  timingOptions.length <= 1
                }
                placeholder={
                  filters.batchId === "ALL"
                    ? "Select batch first"
                    : filters.mode === "ALL"
                      ? "Select mode first"
                      : timingOptions.length <= 1
                        ? "No timings"
                        : "All Timings"
                }
              />
            </div>

            <Button
              type="button"
              onClick={() => {
                setEditAssessmentId(null);
                setAddOpen(true);
              }}
              className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] sm:w-auto"
            >
              <Plus
                className="mr-1 h-4 w-4 stroke-[2.5] text-white"
                aria-hidden="true"
              />
              Add Assessment
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="gap-3">
        <div className="flex flex-col gap-2 border-b border-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-0 bg-transparent p-0 lg:w-auto">
            <TabsTrigger value="records" className={TAB_CLASS}>
              Records
            </TabsTrigger>
            <TabsTrigger value="progress" className={TAB_CLASS}>
              Batch Progress
            </TabsTrigger>
            <TabsTrigger value="batch" className={TAB_CLASS}>
              Batch Overview
            </TabsTrigger>
            <TabsTrigger value="session" className={TAB_CLASS}>
              Session Overview
            </TabsTrigger>
          </TabsList>

          {showDateFilters ? (
            <div className="flex flex-wrap items-center justify-end gap-1.5 pb-2 lg:pb-0">
              <div
                className="flex shrink-0 items-center overflow-hidden rounded-lg border border-[#DCE8F5] bg-white"
                role="group"
                aria-label="Date range"
              >
                {DATE_PRESET_ROW_BUTTONS.map(({ label, preset }) => {
                  const isActive = filters.datePreset === preset;

                  return (
                    <button
                      key={preset}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => selectDatePreset(preset)}
                      className={cn(
                        "h-8 px-2.5 text-xs font-semibold transition-colors sm:px-3",
                        preset !== "TODAY" && "border-l border-[#DCE8F5]",
                        isActive
                          ? "bg-[#102A56] text-white"
                          : "text-[#102A56] hover:bg-slate-50",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-8 shrink-0 rounded-lg border-[#DCE8F5] px-2.5 text-xs font-semibold text-[#102A56] hover:bg-slate-50 sm:px-3 sm:text-sm"
                onClick={openMoreFilters}
              >
                <ListFilter
                  className="mr-1.5 h-4 w-4 stroke-[2.5] text-[#102A56]"
                  aria-hidden="true"
                />
                More Filters
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-8 shrink-0 rounded-lg border-[#DCE8F5] px-2.5 text-xs font-semibold text-[#102A56] hover:bg-slate-50 sm:px-3 sm:text-sm"
                onClick={clearFilters}
              >
                Clear
              </Button>
            </div>
          ) : null}
        </div>

        <TabsContent value="records" className="mt-0">
          {activeReportQuery.error ? (
            <ErrorState
              description={activeReportQuery.error}
              onRetry={activeReportQuery.reload}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
              {recordsLoading ? (
                <SkeletonTable rows={8} />
              ) : (
                <>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-full border-collapse text-sm">
                      <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                        <tr>
                          <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                            Date
                          </th>
                          <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                            Batch
                          </th>
                          <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                            Course
                          </th>
                          <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                            Assessment
                          </th>
                          <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                            Type
                          </th>
                          <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                            Students
                          </th>
                          <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                            Max Marks
                          </th>
                          <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                            Avg %
                          </th>
                          <th className="w-[4.5rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                          <tr>
                            <td
                              colSpan={COLUMN_COUNT}
                              className="!px-4 !py-4 align-middle"
                            >
                              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                                <h3 className="text-base font-semibold">
                                  {filters.datePreset === "TODAY"
                                    ? "No Assessment Records For Today"
                                    : "No Assessment Records Found"}
                                </h3>
                                <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                                  {filters.datePreset === "TODAY"
                                    ? "Records appear here once assessments are saved."
                                    : "Try changing your filters or date range."}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                            >
                              <td className="!px-4 !py-4 align-middle whitespace-nowrap text-sm text-slate-700">
                                {formatAttendanceDisplayDate(String(item.date))}
                              </td>
                              <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                                {item.batch.name}
                              </td>
                              <td className="min-w-[120px] !px-4 !py-4 align-middle text-sm text-slate-700">
                                {item.course?.title ?? "—"}
                              </td>
                              <td className="min-w-[140px] !px-4 !py-4 align-middle text-sm font-medium text-[#102A56]">
                                {item.name}
                              </td>
                              <td className="!px-4 !py-4 align-middle">
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded border px-2 py-0 text-[11px] font-semibold leading-5",
                                    getAssessmentTypeBadgeClass(item.type),
                                  )}
                                >
                                  {item.type}
                                </span>
                              </td>
                              <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                                {item.studentCount}
                              </td>
                              <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                                {item.maxMarks}
                              </td>
                              <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                                {item.averagePercentage}%
                              </td>
                              <td className="!px-8 !py-4 text-right align-middle">
                                <div className="flex items-center justify-end gap-2">
                                  <Tooltip content="Manage">
                                    <button
                                      type="button"
                                      className={`${iconButtonClass} text-blue-900`}
                                      aria-label="Manage"
                                      onClick={() => {
                                        setEditAssessmentId(item.id);
                                        setAddOpen(true);
                                      }}
                                    >
                                      <Settings2 className={iconClass} />
                                    </button>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
                      <span>
                        Showing {from}–{to} of {total}
                      </span>
                      <label className="flex items-center gap-1.5">
                        <span className="whitespace-nowrap">Rows per page</span>
                        <select
                          className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                          value={pageSize}
                          onChange={(event) => {
                            setPageSize(Number(event.target.value));
                            setPage(1);
                          }}
                        >
                          {[10, 20, 50, 100].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <CategoryPagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="mt-0">
          <AssessmentProgressPanel
            batches={batches}
            reloadKey={progressReloadKey}
          />
        </TabsContent>

        <TabsContent value="batch" className="mt-0">
          <AssessmentBatchOverview
            batches={batches}
            initialBatchId={
              filters.batchId === "ALL" ? undefined : filters.batchId
            }
          />
        </TabsContent>

        <TabsContent value="session" className="mt-0">
          <AssessmentSessionOverview
            batches={batches}
            initialBatchId={
              filters.batchId === "ALL" ? undefined : filters.batchId
            }
            dateFrom={dateRange.from}
            dateTo={dateRange.to}
          />
        </TabsContent>
      </Tabs>

      <AddAssessmentModal
        open={addOpen}
        editAssessmentId={editAssessmentId}
        onClose={() => {
          setAddOpen(false);
          setEditAssessmentId(null);
        }}
        onSaved={() => {
          reloadRecords();
          setProgressReloadKey((value) => value + 1);
        }}
        batches={batches}
      />

      <Modal
        open={moreFiltersOpen}
        title="More Filters"
        onClose={() => setMoreFiltersOpen(false)}
        contentClassName="max-w-md"
        bodyClassName="px-5 py-4"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-[#DCE8F5] px-4 text-sm font-semibold text-[#102A56] hover:bg-slate-50"
              onClick={() => setMoreFiltersOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 rounded-lg border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:from-[#0284C7] hover:to-[#1D4ED8]"
              onClick={applyMoreFilters}
            >
              Apply Filters
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
              Type
            </label>
            <AppSelect
              value={moreFiltersDraft.type}
              triggerClassName="h-9 rounded-lg px-2.5 text-sm"
              onValueChange={(value) =>
                setMoreFiltersDraft((prev) => ({ ...prev, type: value }))
              }
              options={ASSESSMENT_TYPES}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
              Date From
            </label>
            <Input
              type="date"
              aria-label="Date from"
              className="h-9 rounded-lg border-[#DCE8F5] text-sm text-[#102A56]"
              value={moreFiltersDraft.from}
              onChange={(event) =>
                setMoreFiltersDraft((prev) => ({
                  ...prev,
                  from: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
              Date To
            </label>
            <Input
              type="date"
              aria-label="Date to"
              className="h-9 rounded-lg border-[#DCE8F5] text-sm text-[#102A56]"
              value={moreFiltersDraft.to}
              onChange={(event) =>
                setMoreFiltersDraft((prev) => ({
                  ...prev,
                  to: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
