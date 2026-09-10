"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { BatchListItem } from "@/src/features/branch-ops/types";
import { attendanceStatusVariant } from "@/src/features/branch-ops/utils/attendance-date.utils";
import {
  type BatchMode,
  getBatchModeSectionLabel,
  getConfiguredBatchModes,
  getTimingsForMode,
} from "@/src/features/branch-ops/utils/batch-mode.utils";
import {
  formatMonthlyAttendancePercentage,
  mapTimingStudentRowToMonthlyRow,
  type MonthlyAttendanceStudentRow,
} from "@/src/features/branch-ops/utils/monthly-attendance.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { CategoryPagination } from "@/src/shared/components/ui/category-pagination";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
}

const FILTER_TRIGGER =
  "h-9 rounded-lg px-2.5 text-sm w-full min-w-0 [&>span]:line-clamp-1 [&>span]:text-left";

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

const COLUMN_COUNT = 8;

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
  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [mode, setMode] = useState<string>("");
  const [batchTimingId, setBatchTimingId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [rows, setRows] = useState<MonthlyAttendanceStudentRow[]>([]);
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
    if (!batchId || !batchTimingId || !mode) {
      setRows([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .batchTimingStudentAttendance(batchId, batchTimingId)
      .then((response) => {
        if (cancelled) return;
        setRows(
          response.students
            .map(mapTimingStudentRowToMonthlyRow)
            .sort((a, b) => a.studentName.localeCompare(b.studentName)),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : null;
        setError(message ?? "Unable to load monthly attendance.");
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, batchTimingId, mode]);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesStudentSearch(row, debouncedSearch)),
    [rows, debouncedSearch],
  );

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const selectionLabel = selectedBatch
    ? `${selectedBatch.name} · ${mode ? getBatchModeSectionLabel(mode as BatchMode) : "—"} · ${selectedTiming?.label ?? "—"}`
    : null;

  const hasSelection = Boolean(batchId && mode && batchTimingId);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#E1EBF5] bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
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
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
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
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
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
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
              Student Search
            </label>
            <SearchInput
              value={search}
              placeholder="Search student name/code..."
              className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
              onChange={setSearch}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
        {!hasSelection ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center px-4 py-6 text-center">
            <h3 className="text-base font-semibold text-[#102A56]">
              Select Batch Details
            </h3>
            <p className="mt-1 max-w-md text-sm text-[#647A9B]">
              Select main batch, learning mode, and batch timing to view monthly
              attendance.
            </p>
          </div>
        ) : loading ? (
          <SkeletonTable rows={8} />
        ) : error ? (
          <div className="p-3">
            <ErrorState description={error} />
          </div>
        ) : (
          <>
            {selectionLabel ? (
              <p className="border-b border-[#D9E4F2] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#647A9B]">
                {selectionLabel}
              </p>
            ) : null}

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                  <tr>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Student Code
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Student Name
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Working Days / Sessions
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Present
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Absent
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Late
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Attendance %
                    </th>
                    <th className="w-[4.5rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={COLUMN_COUNT}
                        className="!px-4 !py-4 align-middle"
                      >
                        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                          <h3 className="text-base font-semibold">
                            No Students Found
                          </h3>
                          <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                            {debouncedSearch
                              ? "No students match your search."
                              : "No admitted students in this batch timing."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row) => (
                      <tr
                        key={row.studentId}
                        className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                      >
                        <td className="!px-4 !py-4 align-middle font-mono text-xs text-slate-700">
                          {row.studentCode}
                        </td>
                        <td className="!px-4 !py-4 align-middle text-sm font-medium leading-snug text-[#102A56]">
                          {row.studentName}
                        </td>
                        <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                          {row.workingSessions}
                        </td>
                        <td className="!px-4 !py-4 align-middle">
                          <Badge
                            variant={attendanceStatusVariant("PRESENT")}
                            className={compactBadgeClass}
                          >
                            {row.present}
                          </Badge>
                        </td>
                        <td className="!px-4 !py-4 align-middle">
                          <Badge
                            variant={attendanceStatusVariant("ABSENT")}
                            className={compactBadgeClass}
                          >
                            {row.absent}
                          </Badge>
                        </td>
                        <td className="!px-4 !py-4 align-middle">
                          <Badge
                            variant={attendanceStatusVariant("LATE")}
                            className={compactBadgeClass}
                          >
                            {row.late}
                          </Badge>
                        </td>
                        <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                          {formatMonthlyAttendancePercentage(row.percentage)}
                        </td>
                        <td className="!px-8 !py-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip content="Calendar">
                              <Link
                                href={`/attendance/details/${batchId}/${row.studentId}`}
                                className={`${iconButtonClass} text-blue-900`}
                                aria-label="Calendar"
                              >
                                <CalendarDays className={iconClass} />
                              </Link>
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
    </div>
  );
}
