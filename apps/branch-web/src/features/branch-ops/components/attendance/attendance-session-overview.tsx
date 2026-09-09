"use client";

import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { AttendanceSessionDetailModal } from "@/src/features/branch-ops/components/attendance/attendance-session-detail-modal";
import {
  AttendanceDateRangeFilters,
  defaultAttendanceDateRangeFilters,
  resolveDateRangeFromFilters,
  type AttendanceDateRangeFilterState,
} from "@/src/features/branch-ops/components/attendance/attendance-date-range-filters";
import type { AttendanceItem, BatchListItem } from "@/src/features/branch-ops/types";
import { formatAttendanceDisplayDate } from "@/src/features/branch-ops/utils/attendance-date.utils";
import {
  type BatchMode,
  getBatchModeSectionLabel,
  getConfiguredBatchModes,
  getTimingsForMode,
} from "@/src/features/branch-ops/utils/batch-mode.utils";
import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { AppSelect } from "@/src/shared/components/ui/select";
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

type SessionRow = {
  dateKey: string;
  batchName: string;
  mode: string;
  timingName: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
};

const FILTER_TRIGGER =
  "h-[46px] rounded-xl w-full min-w-0 text-sm [&>span]:line-clamp-1 [&>span]:text-left";

export function AttendanceSessionOverview({
  batches,
  initialBatchId,
}: Props) {
  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [mode, setMode] = useState<string>("");
  const [batchTimingId, setBatchTimingId] = useState("");
  const [dateFilters, setDateFilters] = useState<AttendanceDateRangeFilterState>(
    defaultAttendanceDateRangeFilters,
  );
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [viewSessionDate, setViewSessionDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateRange = useMemo(
    () => resolveDateRangeFromFilters(dateFilters),
    [dateFilters],
  );

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

  useEffect(() => {
    if (initialBatchId) setBatchId(initialBatchId);
  }, [initialBatchId]);

  useEffect(() => {
    setMode("");
    setBatchTimingId("");
    setViewSessionDate(null);
  }, [batchId]);

  useEffect(() => {
    setBatchTimingId("");
    setViewSessionDate(null);
  }, [mode]);

  useEffect(() => {
    setViewSessionDate(null);
  }, [batchTimingId, dateRange.from, dateRange.to]);

  useEffect(() => {
    if (!batchId || !batchTimingId) {
      setItems([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadAll = async () => {
      const first = await branchOpsApi.attendanceReport({
        batchId,
        batchTimingId,
        from: dateRange.from,
        to: dateRange.to,
        requireBatchTiming: "true",
        take: 200,
        skip: 0,
      });

      if (cancelled) return;

      const all = [...(first.items ?? [])];
      let skip = 200;
      while (skip < first.total) {
        const page = await branchOpsApi.attendanceReport({
          batchId,
          batchTimingId,
          from: dateRange.from,
          to: dateRange.to,
          requireBatchTiming: "true",
          take: 200,
          skip,
        });
        if (cancelled) return;
        all.push(...(page.items ?? []));
        if (!(page.items ?? []).length) break;
        skip += 200;
      }

      setItems(all);
    };

    loadAll()
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : null;
        setError(message ?? "Unable to load session attendance.");
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, batchTimingId, dateRange.from, dateRange.to]);

  const sessionRows = useMemo(() => {
    const map = new Map<string, SessionRow>();

    for (const item of items) {
      const dateKey = String(item.date).slice(0, 10);
      const current = map.get(dateKey) ?? {
        dateKey,
        batchName: item.batch.name,
        mode: item.batchTiming
          ? getBatchModeSectionLabel(item.batchTiming.mode)
          : "—",
        timingName: item.batchTiming?.name ?? "—",
        totalStudents: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
      };

      current.totalStudents += 1;
      if (item.status === "PRESENT") current.present += 1;
      if (item.status === "ABSENT") current.absent += 1;
      if (item.status === "LATE") current.late += 1;
      map.set(dateKey, current);
    }

    return [...map.values()]
      .map((row) => ({
        ...row,
        percentage:
          row.totalStudents > 0
            ? Math.round((row.present / row.totalStudents) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [items]);

  const selectedTiming = timingOptions.find(
    (option) => option.value === batchTimingId,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Main Batch
          </label>
          <AppSelect
            value={batchId || undefined}
            triggerClassName={FILTER_TRIGGER}
            placeholder="Select main batch"
            onValueChange={setBatchId}
            options={batches.map((batch) => ({
              label: `${batch.name} (${batch.code})`,
              value: batch.id,
            }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Learning Mode
          </label>
          <AppSelect
            value={mode || undefined}
            triggerClassName={FILTER_TRIGGER}
            placeholder={!batchId ? "Select batch first" : "Select mode"}
            onValueChange={setMode}
            disabled={!batchId}
            options={modeOptions}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Batch Timing
          </label>
          <AppSelect
            value={batchTimingId || undefined}
            triggerClassName={FILTER_TRIGGER}
            placeholder={
              !mode ? "Select learning mode first" : "Select batch timing"
            }
            onValueChange={setBatchTimingId}
            disabled={!batchId || !mode}
            options={timingOptions}
          />
        </div>
      </div>

      <AttendanceDateRangeFilters
        filters={dateFilters}
        onChange={(patch) =>
          setDateFilters((prev) => ({ ...prev, ...patch }))
        }
      />

      {!batchId || !mode || !batchTimingId ? (
        <EmptyState title="Select main batch, learning mode, and batch timing to view attendance sessions." />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-[#102A56]">
              Attendance Sessions · {selectedTiming?.label ?? "Batch Timing"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Day-by-day attendance sessions for the selected batch timing.
            </p>
          </div>

          {!sessionRows.length ? (
            <EmptyState title="No attendance sessions found for this batch timing in the selected date range." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Attendance %</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionRows.map((row) => (
                    <TableRow key={row.dateKey}>
                      <TableCell>
                        {formatAttendanceDisplayDate(row.dateKey)}
                      </TableCell>
                      <TableCell>{row.batchName}</TableCell>
                      <TableCell>{row.mode}</TableCell>
                      <TableCell>{row.timingName}</TableCell>
                      <TableCell>{row.totalStudents}</TableCell>
                      <TableCell>{row.present}</TableCell>
                      <TableCell>{row.absent}</TableCell>
                      <TableCell>{row.late}</TableCell>
                      <TableCell>{row.percentage}%</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewSessionDate(row.dateKey)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <AttendanceSessionDetailModal
        open={Boolean(viewSessionDate)}
        onClose={() => setViewSessionDate(null)}
        batchId={batchId}
        batchTimingId={batchTimingId}
        date={viewSessionDate ?? ""}
      />
    </div>
  );
}
