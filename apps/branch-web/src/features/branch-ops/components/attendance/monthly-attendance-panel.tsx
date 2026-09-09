"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  AttendanceItem,
  BatchListItem,
  BatchStudentItem,
} from "@/src/features/branch-ops/types";
import { attendanceStatusVariant } from "@/src/features/branch-ops/utils/attendance-date.utils";
import {
  type BatchMode,
  getBatchModeSectionLabel,
  getConfiguredBatchModes,
  getTimingsForMode,
} from "@/src/features/branch-ops/utils/batch-mode.utils";
import {
  buildMonthlyStudentRows,
  currentMonthlyAttendanceLabel,
  currentMonthlyAttendanceRange,
  extractSessionDates,
  formatMonthlyAttendancePercentage,
  type MonthlyAttendanceStudentRow,
} from "@/src/features/branch-ops/utils/monthly-attendance.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
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

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
}

const FILTER_H = "h-[46px]";
const FILTER_RADIUS = "rounded-xl";
const FILTER_TRIGGER = `${FILTER_H} ${FILTER_RADIUS} w-full min-w-0 text-sm [&>span]:line-clamp-1 [&>span]:text-left`;

async function loadMonthlyAttendanceRecords(params: {
  batchId: string;
  batchTimingId: string;
  from: string;
  to: string;
}): Promise<AttendanceItem[]> {
  const first = await branchOpsApi.attendanceReport({
    batchId: params.batchId,
    batchTimingId: params.batchTimingId,
    from: params.from,
    to: params.to,
    requireBatchTiming: "true",
    take: 200,
    skip: 0,
  });

  const all = [...(first.items ?? [])];
  let skip = 200;
  while (skip < first.total) {
    const page = await branchOpsApi.attendanceReport({
      batchId: params.batchId,
      batchTimingId: params.batchTimingId,
      from: params.from,
      to: params.to,
      requireBatchTiming: "true",
      take: 200,
      skip,
    });
    all.push(...(page.items ?? []));
    if (!(page.items ?? []).length) break;
    skip += 200;
  }

  return all;
}

function studentDisplayName(student: BatchStudentItem): string {
  return [student.firstName, student.lastName].filter(Boolean).join(" ");
}

function matchesStudentSearch(
  row: MonthlyAttendanceStudentRow,
  search: string,
): boolean {
  if (!search) return true;
  const query = search.toLowerCase();
  return (
    row.studentName.toLowerCase().includes(query) ||
    row.studentCode.toLowerCase().includes(query)
  );
}

export function MonthlyAttendancePanel({
  batches,
  initialBatchId,
}: Props) {
  const monthRange = useMemo(() => currentMonthlyAttendanceRange(), []);
  const monthLabel = useMemo(() => currentMonthlyAttendanceLabel(), []);

  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [mode, setMode] = useState<string>("");
  const [batchTimingId, setBatchTimingId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [students, setStudents] = useState<BatchStudentItem[]>([]);
  const [records, setRecords] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBatchId) setBatchId(initialBatchId);
  }, [initialBatchId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === batchId) ?? null,
    [batches, batchId],
  );

  const modeOptions = useMemo(() => {
    if (!selectedBatch) return [];
    return getConfiguredBatchModes(selectedBatch).map((value) => ({
      label: getBatchModeSectionLabel(value),
      value,
    }));
  }, [selectedBatch]);

  const timingOptions = useMemo(() => {
    if (!selectedBatch || !mode) return [];
    return getTimingsForMode(selectedBatch, mode as BatchMode).map((timing) => ({
      label: timing.name,
      value: timing.id,
    }));
  }, [selectedBatch, mode]);

  const selectedTiming = useMemo(
    () => timingOptions.find((timing) => timing.value === batchTimingId),
    [timingOptions, batchTimingId],
  );

  useEffect(() => {
    setMode("");
    setBatchTimingId("");
  }, [batchId]);

  useEffect(() => {
    setBatchTimingId("");
  }, [mode]);

  useEffect(() => {
    if (!batchId || !batchTimingId) {
      setStudents([]);
      setRecords([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      branchOpsApi.batchStudents(batchId),
      loadMonthlyAttendanceRecords({
        batchId,
        batchTimingId,
        from: monthRange.from,
        to: monthRange.to,
      }),
    ])
      .then(([batchStudents, attendanceRecords]) => {
        if (cancelled) return;
        setStudents(
          batchStudents.filter(
            (student) =>
              student.batchTiming?.id === batchTimingId &&
              student.enrollmentStatus === "ADMITTED",
          ),
        );
        setRecords(attendanceRecords);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : null;
        setError(message ?? "Unable to load monthly attendance.");
        setStudents([]);
        setRecords([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, batchTimingId, monthRange.from, monthRange.to]);

  const sessionDates = useMemo(() => extractSessionDates(records), [records]);

  const studentInputs = useMemo(
    () =>
      students.map((student) => ({
        id: student.id,
        enrollmentId: student.enrollmentId,
        studentCode: student.studentCode,
        name: studentDisplayName(student),
        enrollmentDate: student.enrollmentDate,
      })),
    [students],
  );

  const rows = useMemo(
    () =>
      buildMonthlyStudentRows({
        students: studentInputs,
        records,
        monthFrom: monthRange.from,
        monthTo: monthRange.to,
        sessionDates,
      }).sort((a, b) => a.studentName.localeCompare(b.studentName)),
    [studentInputs, records, monthRange.from, monthRange.to, sessionDates],
  );

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesStudentSearch(row, debouncedSearch)),
    [rows, debouncedSearch],
  );

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const selectionLabel = selectedBatch
    ? `${selectedBatch.name} · ${mode ? getBatchModeSectionLabel(mode as BatchMode) : "—"} · ${selectedTiming?.label ?? "—"}`
    : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-[#102A56]">Monthly Attendance</p>
        <p className="mt-1 text-sm text-slate-500">
          Student-wise attendance for {monthLabel}. Only actual saved attendance
          sessions are counted.
        </p>
      </div>

      <Card className="overflow-hidden p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Filters
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Main Batch
            </label>
            <AppSelect
              value={batchId || undefined}
              triggerClassName={FILTER_TRIGGER}
              placeholder="Select main batch"
              onValueChange={(value) => setBatchId(value)}
              options={batches.map((batch) => ({
                label: `${batch.name} (${batch.code})`,
                value: batch.id,
              }))}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Learning Mode
            </label>
            <AppSelect
              value={mode || undefined}
              triggerClassName={FILTER_TRIGGER}
              placeholder={batchId ? "Select mode" : "Select batch first"}
              disabled={!batchId || !modeOptions.length}
              onValueChange={(value) => setMode(value)}
              options={modeOptions}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Batch Timing
            </label>
            <AppSelect
              value={batchTimingId || undefined}
              triggerClassName={FILTER_TRIGGER}
              placeholder={
                !batchId
                  ? "Select batch first"
                  : !mode
                    ? "Select mode first"
                    : timingOptions.length
                      ? "Select timing"
                      : "No timings"
              }
              disabled={!batchId || !mode || !timingOptions.length}
              onValueChange={(value) => setBatchTimingId(value)}
              options={timingOptions}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Student Search
            </label>
            <SearchInput
              value={search}
              placeholder="Search student name/code..."
              className={`${FILTER_H} ${FILTER_RADIUS} text-sm`}
              onChange={setSearch}
            />
          </div>
        </div>
      </Card>

      {!batchId || !mode || !batchTimingId ? (
        <EmptyState title="Select main batch, learning mode, and batch timing to view monthly attendance." />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : (
        <>
          {selectionLabel ? (
            <p className="text-sm font-medium text-[#102A56]">{selectionLabel}</p>
          ) : null}

          {!filteredRows.length ? (
            <EmptyState
              title={
                debouncedSearch
                  ? "No students match your search."
                  : "No admitted students in this batch timing."
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Working Days / Sessions</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Attendance %</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRows.map((row) => (
                      <TableRow key={row.studentId}>
                        <TableCell className="font-mono text-xs">
                          {row.studentCode}
                        </TableCell>
                        <TableCell className="font-medium text-[#102A56]">
                          {row.studentName}
                        </TableCell>
                        <TableCell>{row.workingSessions}</TableCell>
                        <TableCell>
                          <Badge variant={attendanceStatusVariant("PRESENT")}>
                            {row.present}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={attendanceStatusVariant("ABSENT")}>
                            {row.absent}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={attendanceStatusVariant("LATE")}>
                            {row.late}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatMonthlyAttendancePercentage(row.percentage)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/attendance/details/${batchId}/${row.studentId}`}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2447A8]"
                          >
                            <CalendarDays
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            Calendar
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <TablePaginationBar
                page={page}
                pageSize={pageSize}
                total={filteredRows.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
