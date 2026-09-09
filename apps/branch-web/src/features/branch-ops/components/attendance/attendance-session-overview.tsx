"use client";

import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { AttendanceItem, BatchListItem } from "@/src/features/branch-ops/types";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import {
  type BatchMode,
  getBatchModeSectionLabel,
  getConfiguredBatchModes,
  getTimingsForMode,
} from "@/src/features/branch-ops/utils/batch-mode.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
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
import { cn } from "@/src/shared/lib/cn";

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

type SessionRow = {
  dateKey: string;
  batchName: string;
  mode: string;
  timingName: string;
  courseTitle: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
};

export function AttendanceSessionOverview({
  batches,
  initialBatchId,
  dateFrom,
  dateTo,
}: Props) {
  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [mode, setMode] = useState<string>("");
  const [batchTimingId, setBatchTimingId] = useState("");
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setSelectedDate(null);
  }, [batchId]);

  useEffect(() => {
    setBatchTimingId("");
    setSelectedDate(null);
  }, [mode]);

  useEffect(() => {
    setSelectedDate(null);
  }, [batchTimingId, dateFrom, dateTo]);

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
        from: dateFrom,
        to: dateTo,
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
          from: dateFrom,
          to: dateTo,
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
  }, [batchId, batchTimingId, dateFrom, dateTo]);

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
        courseTitle: item.course.title,
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

  const detailRows = selectedDate
    ? items.filter((item) => String(item.date).slice(0, 10) === selectedDate)
    : [];

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
            placeholder={
              !mode ? "Select learning mode first" : "Select batch timing"
            }
            onValueChange={setBatchTimingId}
            disabled={!batchId || !mode}
            options={timingOptions}
          />
        </div>
      </div>

      {!batchId || !mode || !batchTimingId ? (
        <EmptyState title="Select main batch, learning mode, and batch timing to view session-wise attendance." />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-[#102A56]">
              Session Overview · {selectedTiming?.label ?? "Batch Timing"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Attendance sessions for the selected batch timing
              {dateFrom && dateTo ? ` (${dateFrom} → ${dateTo})` : ""}.
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
                    <TableHead>Main Batch</TableHead>
                    <TableHead>Learning Mode</TableHead>
                    <TableHead>Batch Timing</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionRows.map((row) => (
                    <TableRow
                      key={row.dateKey}
                      className={cn(
                        "cursor-pointer hover:bg-slate-50",
                        selectedDate === row.dateKey && "bg-sky-50/80",
                      )}
                      onClick={() => setSelectedDate(row.dateKey)}
                    >
                      <TableCell>
                        {formatAttendanceDisplayDate(row.dateKey)}
                      </TableCell>
                      <TableCell>{row.batchName}</TableCell>
                      <TableCell>{row.mode}</TableCell>
                      <TableCell>{row.timingName}</TableCell>
                      <TableCell>{row.courseTitle}</TableCell>
                      <TableCell>{row.totalStudents}</TableCell>
                      <TableCell>{row.present}</TableCell>
                      <TableCell>{row.absent}</TableCell>
                      <TableCell>{row.late}</TableCell>
                      <TableCell>{row.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedDate ? (
            <Card className="space-y-3 p-4">
              <h4 className="text-sm font-semibold text-[#102A56]">
                Students · {formatAttendanceDisplayDate(selectedDate)}
              </h4>
              {!detailRows.length ? (
                <EmptyState title="No student records for this session." />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailRows.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.student.name}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.student.studentCode}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={attendanceStatusVariant(item.status)}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
