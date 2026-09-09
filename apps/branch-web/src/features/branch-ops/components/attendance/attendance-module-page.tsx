"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { AttendanceBatchOverview } from "@/src/features/branch-ops/components/attendance/attendance-batch-overview";
import {
  AttendanceDateRangeFilters,
  defaultAttendanceDateRangeFilters,
  resolveDateRangeFromFilters,
} from "@/src/features/branch-ops/components/attendance/attendance-date-range-filters";
import { AttendanceSessionOverview } from "@/src/features/branch-ops/components/attendance/attendance-session-overview";
import { ManageAttendanceModal } from "@/src/features/branch-ops/components/attendance/manage-attendance-modal";
import { TakeAttendanceModal } from "@/src/features/branch-ops/components/attendance/take-attendance-modal";
import type { AttendanceItem } from "@/src/features/branch-ops/types";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
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
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { ListPageHeader } from "@/src/shared/components/ui/list-page-header";
import { Loader } from "@/src/shared/components/ui/loader";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { TablePaginationBar } from "@/src/shared/components/ui/table-pagination";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Late", value: "LATE" },
];

const MODE_OPTIONS: Array<{ label: string; value: BatchMode }> = [
  { label: BATCH_MODE_SECTION_LABELS.OFFLINE, value: "OFFLINE" },
  { label: BATCH_MODE_SECTION_LABELS.ONLINE, value: "ONLINE" },
  { label: BATCH_MODE_SECTION_LABELS.RECORDED, value: "RECORDED" },
];

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const FILTER_H = "h-[46px]";
const FILTER_RADIUS = "rounded-xl";
const FILTER_TRIGGER = `${FILTER_H} ${FILTER_RADIUS} w-full min-w-0 text-sm [&>span]:line-clamp-1 [&>span]:text-left`;

type Filters = {
  search: string;
  batchId: string;
  mode: string;
  batchTimingId: string;
  status: string;
  datePreset: ReturnType<typeof defaultAttendanceDateRangeFilters>["datePreset"];
  from: string;
  to: string;
};

const defaultFilters = (): Filters => ({
  search: "",
  batchId: "ALL",
  mode: "ALL",
  batchTimingId: "ALL",
  status: "ALL",
  ...defaultAttendanceDateRangeFilters(),
});

export function AttendanceModulePage() {
  const role = useAuthStore((state) => state.user?.role);
  const [tab, setTab] = useState("attendance");
  const [takeOpen, setTakeOpen] = useState(false);
  const [manageRecord, setManageRecord] = useState<AttendanceItem | null>(
    null,
  );

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const dateRange = useMemo(
    () => resolveDateRangeFromFilters(filters),
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

  const reportParams = useMemo(
    () => ({
      batchId: filters.batchId === "ALL" ? undefined : filters.batchId,
      batchTimingId:
        filters.batchTimingId === "ALL" ? undefined : filters.batchTimingId,
      mode:
        filters.mode === "ALL"
          ? undefined
          : (filters.mode as BatchMode),
      status: filters.status === "ALL" ? undefined : filters.status,
      search: debouncedSearch || undefined,
      from: dateRange.from,
      to: dateRange.to,
      requireBatchTiming: "true" as const,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    [
      filters.batchId,
      filters.batchTimingId,
      filters.mode,
      filters.status,
      debouncedSearch,
      dateRange.from,
      dateRange.to,
      page,
      pageSize,
    ],
  );

  const reportQuery = useAsyncData(
    () => branchOpsApi.attendanceReport(reportParams),
    [
      reportParams.batchId,
      reportParams.batchTimingId,
      reportParams.mode,
      reportParams.status,
      reportParams.search,
      reportParams.from,
      reportParams.to,
      reportParams.requireBatchTiming,
      reportParams.skip,
      reportParams.take,
    ],
  );

  const items = reportQuery.data?.items ?? [];
  const total = reportQuery.data?.total ?? 0;

  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters());
    setDebouncedSearch("");
    setPage(1);
  };

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
    <div className="space-y-4">
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Attendance"
        title="Attendance"
        totalLabel="Records"
        total={tab === "attendance" ? total : null}
        action={
          <Button type="button" onClick={() => setTakeOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Take Attendance
          </Button>
        }
      />

      {tab === "attendance" ? (
        <Card className="overflow-hidden p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Filters
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 lg:items-center">
            <div className="min-w-0">
              <SearchInput
                value={filters.search}
                placeholder="Search student name/code..."
                className={`${FILTER_H} ${FILTER_RADIUS} text-sm`}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, search: value }))
                }
              />
            </div>

            <div className="min-w-0">
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

            <div className="min-w-0">
              <AppSelect
                value={filters.mode}
                triggerClassName={FILTER_TRIGGER}
                onValueChange={(value) =>
                  updateFilters({ mode: value, batchTimingId: "ALL" })
                }
                options={modeOptions}
              />
            </div>

            <div className="min-w-0">
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

            <div className="min-w-0">
              <AppSelect
                value={filters.status}
                triggerClassName={FILTER_TRIGGER}
                onValueChange={(value) => updateFilters({ status: value })}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>

          <div className="mt-3">
            <AttendanceDateRangeFilters
              filters={filters}
              onChange={(patch) => updateFilters(patch)}
              showClear
              onClear={clearFilters}
            />
          </div>
        </Card>
      ) : null}

      <Tabs value={tab} onValueChange={setTab} className="gap-3">
        <TabsList className="mb-2 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger value="attendance" className={TAB_CLASS}>
            Attendance
          </TabsTrigger>
          <TabsTrigger value="batch-attendance" className={TAB_CLASS}>
            Batch Attendance
          </TabsTrigger>
          <TabsTrigger value="sessions" className={TAB_CLASS}>
            Attendance Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-3">
          <p className="text-sm font-semibold text-[#102A56]">
            Attendance Records
          </p>

          {reportQuery.loading && !reportQuery.data ? (
            <Loader />
          ) : reportQuery.error ? (
            <ErrorState
              description={reportQuery.error}
              onRetry={reportQuery.reload}
            />
          ) : !items.length ? (
            <EmptyState
              title="No attendance records found"
              description="Try changing your filters or date range."
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Timing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Marked By</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatAttendanceDisplayDate(String(item.date))}
                        </TableCell>
                        <TableCell className="font-medium text-[#102A56]">
                          {item.student.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.student.studentCode}
                        </TableCell>
                        <TableCell>{item.batch.name}</TableCell>
                        <TableCell>
                          {item.batchTiming
                            ? getBatchModeSectionLabel(item.batchTiming.mode)
                            : "—"}
                        </TableCell>
                        <TableCell className="max-w-[10rem] truncate">
                          {item.batchTiming?.name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={attendanceStatusVariant(item.status)}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.faculty?.name?.trim() || "—"}
                        </TableCell>
                        <TableCell className="max-w-[12rem] truncate">
                          {item.remarks?.trim() || "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setManageRecord(item)}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <TablePaginationBar
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="batch-attendance">
          <AttendanceBatchOverview
            batches={batches}
            initialBatchId={
              filters.batchId !== "ALL" ? filters.batchId : undefined
            }
          />
        </TabsContent>

        <TabsContent value="sessions">
          <AttendanceSessionOverview
            batches={batches}
            initialBatchId={
              filters.batchId !== "ALL" ? filters.batchId : undefined
            }
          />
        </TabsContent>
      </Tabs>

      <TakeAttendanceModal
        open={takeOpen}
        onClose={() => setTakeOpen(false)}
        onSaved={() => void reportQuery.reload()}
        batches={batches}
      />

      <ManageAttendanceModal
        open={Boolean(manageRecord)}
        record={manageRecord}
        onClose={() => setManageRecord(null)}
        onSaved={() => void reportQuery.reload()}
      />
    </div>
  );
}
