"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { ManageAttendanceModal } from "@/src/features/branch-ops/components/attendance/manage-attendance-modal";
import { TakeAttendanceModal } from "@/src/features/branch-ops/components/attendance/take-attendance-modal";
import type { AttendanceItem } from "@/src/features/branch-ops/types";
import {
  type AttendanceDatePreset,
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
  formatAttendanceMarkedAt,
  resolveAttendanceDateRange,
  todayLocalInput,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { formatRoleLabel } from "@/src/core/auth/roles";

const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Late", value: "LATE" },
];

const DATE_PRESET_OPTIONS: Array<{ label: string; value: AttendanceDatePreset }> =
  [
    { label: "Today", value: "TODAY" },
    { label: "Yesterday", value: "YESTERDAY" },
    { label: "This Week", value: "THIS_WEEK" },
    { label: "This Month", value: "THIS_MONTH" },
    { label: "Custom", value: "CUSTOM" },
  ];

export default function AttendancePage() {
  const role = useAuthStore((state) => state.user?.role);
  const [takeOpen, setTakeOpen] = useState(false);
  const [manageRecord, setManageRecord] = useState<AttendanceItem | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [datePreset, setDatePreset] =
    useState<AttendanceDatePreset>("TODAY");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [batchId, setBatchId] = useState("ALL");
  const [batchCourseId, setBatchCourseId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const dateRange = useMemo(
    () => resolveAttendanceDateRange(datePreset, from, to),
    [datePreset, from, to],
  );

  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);
  const sessionsQuery = useAsyncData(
    () =>
      batchId !== "ALL"
        ? branchOpsApi.batchSessions(batchId)
        : Promise.resolve([]),
    [batchId],
  );

  const reportParams = useMemo(
    () => ({
      batchId: batchId === "ALL" ? undefined : batchId,
      batchCourseId: batchCourseId === "ALL" ? undefined : batchCourseId,
      status: status === "ALL" ? undefined : status,
      search: debouncedSearch || undefined,
      from: dateRange.from,
      to: dateRange.to,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    [
      batchId,
      batchCourseId,
      status,
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
  const totals = reportQuery.data?.totals;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setDatePreset("TODAY");
    setFrom("");
    setTo("");
    setBatchId("ALL");
    setBatchCourseId("ALL");
    setStatus("ALL");
    setPage(1);
  };

  if (batchesQuery.loading || (reportQuery.loading && reportQuery.data == null)) {
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
          <Button onClick={() => setTakeOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Take Attendance
          </Button>
        }
      />

      <Card className="space-y-3 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Filters
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            value={search}
            placeholder="Search student name/code..."
            className="h-[46px] rounded-xl"
            onChange={setSearch}
          />
          <AppSelect
            value={batchId}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => {
              setBatchId(value);
              setBatchCourseId("ALL");
              setPage(1);
            }}
            options={[
              { label: "All Batches", value: "ALL" },
              ...(batchesQuery.data ?? []).map((batch) => ({
                label: `${batch.name} (${batch.code})`,
                value: batch.id,
              })),
            ]}
          />
          <AppSelect
            value={batchCourseId}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => {
              setBatchCourseId(value);
              setPage(1);
            }}
            options={[
              { label: "All Sessions", value: "ALL" },
              ...(sessionsQuery.data ?? []).map((session) => ({
                label: session.label,
                value: session.batchCourseId,
              })),
            ]}
            disabled={batchId === "ALL" || sessionsQuery.loading}
            placeholder={
              sessionsQuery.loading ? "Loading sessions..." : "All Sessions"
            }
          />
          <AppSelect
            value={status}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AppSelect
            value={datePreset}
            triggerClassName="h-[46px] rounded-xl"
            onValueChange={(value) => {
              setDatePreset(value as AttendanceDatePreset);
              if (value !== "CUSTOM") {
                setFrom("");
                setTo("");
              } else if (!from && !to) {
                const today = todayLocalInput();
                setFrom(today);
                setTo(today);
              }
              setPage(1);
            }}
            options={DATE_PRESET_OPTIONS}
          />
          <Input
            type="date"
            className="h-[46px] rounded-xl"
            value={datePreset === "CUSTOM" ? from : dateRange.from ?? ""}
            disabled={datePreset !== "CUSTOM"}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            className="h-[46px] rounded-xl"
            value={datePreset === "CUSTOM" ? to : dateRange.to ?? ""}
            disabled={datePreset !== "CUSTOM"}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
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

      {totals ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="p-4 text-sm">
            <p className="text-xs text-slate-500">Total</p>
            <p className="mt-1 text-lg font-semibold text-[#102A56]">
              {totals.total}
            </p>
          </Card>
          <Card className="p-4 text-sm">
            <p className="text-xs text-slate-500">Present</p>
            <p className="mt-1 text-lg font-semibold text-emerald-700">
              {totals.present}
            </p>
          </Card>
          <Card className="p-4 text-sm">
            <p className="text-xs text-slate-500">Absent</p>
            <p className="mt-1 text-lg font-semibold text-rose-700">
              {totals.absent}
            </p>
          </Card>
          <Card className="p-4 text-sm">
            <p className="text-xs text-slate-500">Late</p>
            <p className="mt-1 text-lg font-semibold text-amber-700">
              {totals.late}
            </p>
          </Card>
          <Card className="p-4 text-sm">
            <p className="text-xs text-slate-500">Attendance %</p>
            <p className="mt-1 text-lg font-semibold text-[#102A56]">
              {totals.percentage}%
            </p>
          </Card>
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#102A56]">
          Attendance Records
        </p>

        {reportQuery.loading ? (
          <Loader />
        ) : reportQuery.error ? (
          <ErrorState
            description={
              reportQuery.error || "Unable to load attendance. Please try again."
            }
            onRetry={reportQuery.reload}
          />
        ) : !items.length ? (
          <EmptyState
            title={
              datePreset === "TODAY"
                ? "No attendance records for today"
                : "No attendance records found"
            }
            description={
              datePreset === "TODAY"
                ? "Attendance records will appear here once attendance is marked."
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
                    <TableHead>Marked At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
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
                        {item.session.sessionNumber != null
                          ? `Session ${item.session.sessionNumber}`
                          : item.session.label}
                      </TableCell>
                      <TableCell>{item.course.title}</TableCell>
                      <TableCell>
                        <Badge variant={attendanceStatusVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatAttendanceMarkedAt(
                          item.markedAt ?? item.updatedAt ?? item.createdAt,
                        )}
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
      </div>

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
