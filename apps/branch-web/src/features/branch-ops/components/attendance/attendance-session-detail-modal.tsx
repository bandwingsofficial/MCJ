"use client";

import { useEffect, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { AttendanceSheet } from "@/src/features/branch-ops/types";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import { getBatchModeSectionLabel } from "@/src/features/branch-ops/utils/batch-mode.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

interface Props {
  open: boolean;
  onClose: () => void;
  batchId: string;
  batchTimingId: string;
  date: string;
}

export function AttendanceSessionDetailModal({
  open,
  onClose,
  batchId,
  batchTimingId,
  date,
}: Props) {
  const [sheet, setSheet] = useState<AttendanceSheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !batchId || !batchTimingId || !date) {
      setSheet(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .attendanceSheet({ batchId, batchTimingId, date })
      .then((result) => {
        if (!cancelled) setSheet(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : null;
        setError(message ?? "Unable to load session attendance.");
        setSheet(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, batchId, batchTimingId, date]);

  const modeLabel = sheet?.timing?.mode
    ? getBatchModeSectionLabel(sheet.timing.mode)
    : "—";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Attendance Session Details"
      contentClassName="max-w-3xl"
    >
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : !sheet ? (
        <p className="text-sm text-slate-500">No session data available.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Date
              </p>
              <p className="mt-1 text-sm font-medium text-[#102A56]">
                {formatAttendanceDisplayDate(date)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Main Batch
              </p>
              <p className="mt-1 text-sm font-medium text-[#102A56]">
                {sheet.batch.name}
                {sheet.batch.code ? ` (${sheet.batch.code})` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Learning Mode
              </p>
              <p className="mt-1 text-sm font-medium text-[#102A56]">
                {modeLabel}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Batch Timing
              </p>
              <p className="mt-1 text-sm font-medium text-[#102A56]">
                {sheet.timing?.name ?? "—"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheet.students.map((student) => (
                  <TableRow key={student.enrollmentId}>
                    <TableCell className="font-medium text-[#102A56]">
                      {student.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {student.studentCode}
                    </TableCell>
                    <TableCell>
                      {student.status ? (
                        <Badge variant={attendanceStatusVariant(student.status)}>
                          {student.status}
                        </Badge>
                      ) : (
                        <span className="text-sm text-slate-400">Not marked</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[12rem] truncate text-sm text-slate-600">
                      {student.remarks?.trim() || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Modal>
  );
}
