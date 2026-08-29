"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { AttendanceBatchOverview } from "@/src/features/branch-ops/components/attendance/attendance-batch-overview";
import { AttendanceSessionOverview } from "@/src/features/branch-ops/components/attendance/attendance-session-overview";
import { ManageAttendanceModal } from "@/src/features/branch-ops/components/attendance/manage-attendance-modal";
import { TakeAttendanceModal } from "@/src/features/branch-ops/components/attendance/take-attendance-modal";
import type { AttendanceItem } from "@/src/features/branch-ops/types";
import {
  type AttendanceDatePreset,
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
  resolveAttendanceDateRange,
  todayLocalInput,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Input } from "@/src/shared/components/ui/input";
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

const DATE_PRESET_OPTIONS: Array<{
  label: string;
  value: AttendanceDatePreset;
}> = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Custom", value: "CUSTOM" },
];

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

type Filters = {
  search: string;
  batchId: string;
  batchCourseId: string;
  status: string;
  datePreset: AttendanceDatePreset;
  from: string;
  to: string;
};

const defaultFilters = (): Filters => ({
  search: "",
  batchId: "ALL",
  batchCourseId: "ALL",
  status: "ALL",
  datePreset: "TODAY",
  from: "",
  to: "",
});

export function AttendanceModulePage() {
  const role = useAuthStore((state) => state.user?.role);
  const [tab, setTab] = useState("records");
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
    () =>
      resolveAttendanceDateRange(filters.datePreset, filters.from, filters.to),
    [filters.datePreset, filters.from, filters.to],
  );

  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);

  const sessionsQuery = useAsyncData(
    () =>
      filters.batchId !== "ALL"
        ? branchOpsApi.batchSessions(filters.batchId)
        : Promise.resolve([]),
    [filters.batchId],
  );

  const reportParams = useMemo(
    () => ({
      batchId: filters.batchId === "ALL" ? undefined : filters.batchId,
      batchCourseId:
        filters.batchCourseId === "ALL" ? undefined : filters.batchCourseId,
      status: filters.status === "ALL" ? undefined : filters.status,
      search: debouncedSearch || undefined,
      from: dateRange.from,
      to: dateRange.to,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    [
      filters.batchId,
      filters.batchCourseId,
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
      reportParams.batchCourseId,
      reportParams.status,
      reportParams.search,
      reportParams.from,
      reportParams.to,
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
    <div className="space-y-5">
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Attendance"
        title="Attendance"
        totalLabel="Records"
        total={total}
        action={
          <Button type="button" onClick={() => setTakeOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Take Attendance
          </Button>
        }
      />

      <Card className="space-y-3 overflow-hidden p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Filters
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            value={filters.search}
            placeholder="Search student name/code..."
            className="h-[46px] rounded-xl"
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
          />
          <AppSelect
            value={filters.batchId}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) =>
              updateFilters({ batchId: value, batchCourseId: "ALL" })
            }
            options={[
              { label: "All Batches", value: "ALL" },
              ...(batchesQuery.data ?? []).map((batch) => ({
                label: `${batch.name} (${batch.code})`,
                value: batch.id,
              })),
            ]}
          />
          <AppSelect
            value={filters.batchCourseId}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => updateFilters({ batchCourseId: value })}
            options={[
              { label: "All Sessions", value: "ALL" },
              ...(sessionsQuery.data ?? []).map((session) => ({
                label: session.label,
                value: session.batchCourseId,
              })),
            ]}
            disabled={filters.batchId === "ALL" || sessionsQuery.loading}
            placeholder={
              filters.batchId === "ALL"
                ? "Select a batch first"
                : sessionsQuery.loading
                  ? "Loading sessions..."
                  : "All Sessions"
            }
          />
          <AppSelect
            value={filters.status}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => updateFilters({ status: value })}
            options={STATUS_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            className="h-[46px] rounded-xl"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger value="records" className={TAB_CLASS}>
            Records
          </TabsTrigger>
          <TabsTrigger value="batch" className={TAB_CLASS}>
            Batch Overview
          </TabsTrigger>
          <TabsTrigger value="session" className={TAB_CLASS}>
            Session Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-3">
          <p className="text-sm font-semibold text-[#102A56]">
            Attendance Records
            {filters.datePreset === "TODAY" ? (
              <span className="ml-2 text-xs font-medium text-slate-500">
                (Today)
              </span>
            ) : null}
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
              title={
                filters.datePreset === "TODAY"
                  ? "No attendance records for today"
                  : "No attendance records found"
              }
              description={
                filters.datePreset === "TODAY"
                  ? "Records appear here once attendance is marked."
                  : "Try changing your filters or date range."
              }
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
                      <TableHead>Session</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
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
                        <TableCell className="max-w-[10rem] truncate">
                          {item.session.label}
                        </TableCell>
                        <TableCell>{item.course.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={attendanceStatusVariant(item.status)}
                          >
                            {item.status}
                          </Badge>
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

        <TabsContent value="batch">
          <AttendanceBatchOverview
            batches={batchesQuery.data ?? []}
            initialBatchId={
              filters.batchId !== "ALL" ? filters.batchId : undefined
            }
          />
        </TabsContent>

        <TabsContent value="session">
          <AttendanceSessionOverview
            batches={batchesQuery.data ?? []}
            initialBatchId={
              filters.batchId !== "ALL" ? filters.batchId : undefined
            }
            initialSessionId={
              filters.batchCourseId !== "ALL"
                ? filters.batchCourseId
                : undefined
            }
            dateFrom={dateRange.from}
            dateTo={dateRange.to}
          />
        </TabsContent>
      </Tabs>

      <TakeAttendanceModal
        open={takeOpen}
        onClose={() => setTakeOpen(false)}
        onSaved={() => void reportQuery.reload()}
        batches={batchesQuery.data ?? []}
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
