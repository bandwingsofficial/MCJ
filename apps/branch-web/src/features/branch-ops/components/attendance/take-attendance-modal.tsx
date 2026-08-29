"use client";

import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  AttendanceSessionOption,
  AttendanceSheetStudent,
  BatchListItem,
} from "@/src/features/branch-ops/types";
import {
  BLOCKED_BATCH_SELECTION_MESSAGE,
  isBatchSelectableForAssignment,
} from "@/src/features/branch-ops/utils/batch-selection.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { cn } from "@/src/shared/lib/cn";
import { appToast } from "@/src/shared/lib/toast";

const MARK_STATUSES = ["PRESENT", "ABSENT", "LATE"] as const;
type MarkStatus = (typeof MARK_STATUSES)[number];

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  batches: BatchListItem[];
}

export function TakeAttendanceModal({
  open,
  onClose,
  onSaved,
  batches,
}: Props) {
  const [date, setDate] = useState(todayInputValue());
  const [batchId, setBatchId] = useState("");
  const [batchCourseId, setBatchCourseId] = useState("");
  const [statuses, setStatuses] = useState<Record<string, MarkStatus | "">>(
    {},
  );
  const [saving, setSaving] = useState(false);

  const selectableBatches = useMemo(
    () => batches.filter((batch) => isBatchSelectableForAssignment(batch)),
    [batches],
  );

  const sessionsQuery = useAsyncData(
    () =>
      batchId
        ? branchOpsApi.batchSessions(batchId)
        : Promise.resolve([] as AttendanceSessionOption[]),
    [batchId],
  );

  const sheetQuery = useAsyncData(
    () =>
      batchId && batchCourseId && date
        ? branchOpsApi.attendanceSheet({
            batchId,
            batchCourseId,
            date,
          })
        : Promise.resolve(null),
    [batchId, batchCourseId, date],
  );

  useEffect(() => {
    if (!open) return;
    setDate(todayInputValue());
    setBatchId("");
    setBatchCourseId("");
    setStatuses({});
  }, [open]);

  useEffect(() => {
    setBatchCourseId("");
    setStatuses({});
  }, [batchId]);

  useEffect(() => {
    const students = sheetQuery.data?.students ?? [];
    const next: Record<string, MarkStatus | ""> = {};
    for (const student of students) {
      const status = student.status;
      next[student.id] =
        status === "PRESENT" || status === "ABSENT" || status === "LATE"
          ? status
          : "";
    }
    setStatuses(next);
  }, [sheetQuery.data]);

  const students: AttendanceSheetStudent[] = sheetQuery.data?.students ?? [];
  const selectedSession =
    sessionsQuery.data?.find((item) => item.batchCourseId === batchCourseId) ??
    sheetQuery.data?.session ??
    null;
  const selectedBatch =
    selectableBatches.find((batch) => batch.id === batchId) ?? null;

  const summary = useMemo(() => {
    const values = Object.values(statuses);
    return {
      total: students.length,
      present: values.filter((value) => value === "PRESENT").length,
      absent: values.filter((value) => value === "ABSENT").length,
      late: values.filter((value) => value === "LATE").length,
      unmarked: students.filter((student) => !statuses[student.id]).length,
    };
  }, [statuses, students]);

  const markAllPresent = () => {
    const next: Record<string, MarkStatus | ""> = {};
    for (const student of students) {
      next[student.id] = "PRESENT";
    }
    setStatuses(next);
  };

  const save = async () => {
    if (!batchId || !batchCourseId || !date) {
      appToast.error("Select date, batch, and session");
      return;
    }

    if (!students.length) {
      appToast.error("No enrolled students in this batch");
      return;
    }

    if (summary.unmarked > 0) {
      appToast.error("Mark attendance for every enrolled student");
      return;
    }

    try {
      setSaving(true);
      await branchOpsApi.saveAttendanceBulk({
        batchId,
        batchCourseId,
        date,
        records: students.map((student) => ({
          studentId: student.id,
          status: statuses[student.id] as MarkStatus,
        })),
      });
      appToast.success("Attendance saved");
      onSaved();
      onClose();
    } catch {
      appToast.error("Unable to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Take Attendance"
      contentClassName="max-w-5xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={() => void save()}
            disabled={
              saving ||
              !batchId ||
              !batchCourseId ||
              !students.length ||
              summary.unmarked > 0
            }
          >
            {saving ? "Saving..." : "Save Attendance"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Attendance Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Batch
            </label>
            <AppSelect
              value={batchId || undefined}
              placeholder="Select batch"
              onValueChange={setBatchId}
              options={selectableBatches.map((batch) => ({
                label: `${batch.name} (${batch.code})`,
                value: batch.id,
              }))}
            />
            {!selectableBatches.length ? (
              <p className="mt-1 text-xs text-amber-700">
                {BLOCKED_BATCH_SELECTION_MESSAGE}
              </p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Session
            </label>
            <AppSelect
              value={batchCourseId || undefined}
              placeholder="Select session"
              onValueChange={setBatchCourseId}
              options={(sessionsQuery.data ?? []).map((session) => ({
                label: session.label,
                value: session.batchCourseId,
              }))}
              disabled={!batchId || sessionsQuery.loading}
            />
          </div>
        </div>

        {batchId && batchCourseId && selectedSession ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-xs text-slate-500">Date</p>
                <p className="font-medium text-[#102A56]">
                  {formatDisplayDate(date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Branch</p>
                <p className="font-medium text-[#102A56]">
                  {sheetQuery.data?.branch.branchName ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Batch</p>
                <p className="font-medium text-[#102A56]">
                  {selectedBatch
                    ? `${selectedBatch.name} (${selectedBatch.code})`
                    : sheetQuery.data?.batch.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Session</p>
                <p className="font-medium text-[#102A56]">
                  {selectedSession.label}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Course</p>
                <p className="font-medium text-[#102A56]">
                  {selectedSession.course.title}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {batchId && batchCourseId ? (
          sheetQuery.loading ? (
            <p className="text-sm text-[#647A9B]">Loading enrolled students...</p>
          ) : !students.length ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-[#647A9B]">
              No enrolled students in this batch.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">
                  Enrolled students
                  {sheetQuery.data?.hasExisting
                    ? " · Existing attendance loaded"
                    : ""}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={markAllPresent}
                >
                  Mark All Present
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Code</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-xs">
                        {student.studentCode}
                      </TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {MARK_STATUSES.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                setStatuses((prev) => ({
                                  ...prev,
                                  [student.id]: status,
                                }))
                              }
                              className={cn(
                                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
                                statuses[student.id] === status
                                  ? status === "PRESENT"
                                    ? "bg-emerald-600 text-white"
                                    : status === "ABSENT"
                                      ? "bg-rose-600 text-white"
                                      : "bg-amber-500 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                              )}
                            >
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="rounded-xl border border-slate-200 bg-[#F8FBFF] p-4">
                <p className="text-sm font-semibold text-[#102A56]">
                  Attendance Summary
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-4 text-sm">
                  <p>
                    Total Students:{" "}
                    <span className="font-semibold">{summary.total}</span>
                  </p>
                  <p>
                    Present:{" "}
                    <span className="font-semibold text-emerald-700">
                      {summary.present}
                    </span>
                  </p>
                  <p>
                    Absent:{" "}
                    <span className="font-semibold text-rose-700">
                      {summary.absent}
                    </span>
                  </p>
                  <p>
                    Late:{" "}
                    <span className="font-semibold text-amber-700">
                      {summary.late}
                    </span>
                  </p>
                </div>
                {summary.unmarked > 0 ? (
                  <p className="mt-2 text-xs text-amber-700">
                    {summary.unmarked} student(s) still unmarked
                  </p>
                ) : null}
              </div>
            </>
          )
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-[#647A9B]">
            Select date, batch, and session to load enrolled students.
          </p>
        )}
      </div>
    </Modal>
  );
}
