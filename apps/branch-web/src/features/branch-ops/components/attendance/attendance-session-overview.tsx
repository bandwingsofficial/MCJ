"use client";

import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  AttendanceItem,
  AttendanceSessionOption,
  BatchListItem,
} from "@/src/features/branch-ops/types";
import {
  formatAttendanceDisplayDate,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
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
import { Badge } from "@/src/shared/components/ui/badge";
import { attendanceStatusVariant } from "@/src/features/branch-ops/utils/attendance-date.utils";

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
  initialSessionId?: string;
  dateFrom?: string;
  dateTo?: string;
}

type DateRow = {
  dateKey: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
};

export function AttendanceSessionOverview({
  batches,
  initialBatchId,
  initialSessionId,
  dateFrom,
  dateTo,
}: Props) {
  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [batchCourseId, setBatchCourseId] = useState(initialSessionId ?? "");
  const [sessions, setSessions] = useState<AttendanceSessionOption[]>([]);
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBatchId) setBatchId(initialBatchId);
  }, [initialBatchId]);

  useEffect(() => {
    if (initialSessionId) setBatchCourseId(initialSessionId);
  }, [initialSessionId]);

  useEffect(() => {
    if (!batchId) {
      setSessions([]);
      setBatchCourseId("");
      return;
    }
    let cancelled = false;
    branchOpsApi
      .batchSessions(batchId)
      .then((result) => {
        if (!cancelled) setSessions(result);
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  useEffect(() => {
    if (!batchId || !batchCourseId) {
      setItems([]);
      setSelectedDate(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .attendanceReport({
        batchId,
        batchCourseId,
        from: dateFrom,
        to: dateTo,
        take: 200,
        skip: 0,
      })
      .then(async (first) => {
        if (cancelled) return;
        const all = [...(first.items ?? [])];
        let skip = 200;
        while (skip < first.total) {
          const page = await branchOpsApi.attendanceReport({
            batchId,
            batchCourseId,
            from: dateFrom,
            to: dateTo,
            take: 200,
            skip,
          });
          if (cancelled) return;
          all.push(...(page.items ?? []));
          if (!(page.items ?? []).length) break;
          skip += 200;
        }
        setItems(all);
        setSelectedDate(null);
      })
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
  }, [batchId, batchCourseId, dateFrom, dateTo]);

  const selectedSession = sessions.find(
    (session) => session.batchCourseId === batchCourseId,
  );

  const dateRows = useMemo(() => {
    const map = new Map<string, DateRow>();
    for (const item of items) {
      const dateKey = String(item.date).slice(0, 10);
      const current = map.get(dateKey) ?? {
        dateKey,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        percentage: 0,
      };
      current.total += 1;
      if (item.status === "PRESENT") current.present += 1;
      if (item.status === "ABSENT") current.absent += 1;
      if (item.status === "LATE") current.late += 1;
      map.set(dateKey, current);
    }

    return [...map.values()]
      .map((row) => ({
        ...row,
        percentage:
          row.total > 0
            ? Math.round(((row.present + row.late) / row.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [items]);

  const detailRows = selectedDate
    ? items.filter((item) => String(item.date).slice(0, 10) === selectedDate)
    : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-3xl">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Batch
          </label>
          <AppSelect
            value={batchId || undefined}
            placeholder="Select batch"
            onValueChange={(value) => {
              setBatchId(value);
              setBatchCourseId("");
            }}
            options={batches.map((batch) => ({
              label: `${batch.name} (${batch.code})`,
              value: batch.id,
            }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Session
          </label>
          <AppSelect
            value={batchCourseId || undefined}
            placeholder={!batchId ? "Select a batch first" : "Select session"}
            onValueChange={setBatchCourseId}
            disabled={!batchId}
            options={sessions.map((session) => ({
              label: session.label,
              value: session.batchCourseId,
            }))}
          />
        </div>
      </div>

      {!batchId || !batchCourseId ? (
        <EmptyState title="Select a batch and session to view date-wise attendance." />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-[#102A56]">
              {selectedSession?.label ?? "Session Attendance"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Date-wise attendance for the selected session
              {dateFrom && dateTo ? ` (${dateFrom} → ${dateTo})` : ""}.
            </p>
          </div>

          {!dateRows.length ? (
            <EmptyState title="No attendance records for this session in the selected range." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dateRows.map((row) => (
                    <TableRow
                      key={row.dateKey}
                      className={
                        selectedDate === row.dateKey
                          ? "bg-sky-50/80"
                          : "cursor-pointer hover:bg-slate-50"
                      }
                      onClick={() => setSelectedDate(row.dateKey)}
                    >
                      <TableCell>
                        {formatAttendanceDisplayDate(row.dateKey)}
                      </TableCell>
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
                Student records · {formatAttendanceDisplayDate(selectedDate)}
              </h4>
              {!detailRows.length ? (
                <EmptyState title="No student records for this date." />
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
