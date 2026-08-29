"use client";

import { useEffect, useMemo, useState } from "react";

import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
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
import { formatAttendanceDisplayDate } from "@/src/features/branch-ops/utils/attendance-date.utils";
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
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
        ? branchOpsApi.attendanceSheet({ batchId, batchCourseId, date })
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
          : "PRESENT";
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
      present: values.filter((v) => v === "PRESENT").length,
      absent: values.filter((v) => v === "ABSENT").length,
      late: values.filter((v) => v === "LATE").length,
      unmarked: students.filter((s) => !statuses[s.id]).length,
    };
  }, [statuses, students]);

  const save = async () => {
    if (!date) {
      appToast.error("Please select an attendance date.");
      return;
    }
    if (!batchId) {
      appToast.error("Please select a batch.");
      return;
    }
    if (!batchCourseId) {
      appToast.error("Please select a session.");
      return;
    }
    if (!students.length) {
      appToast.error("No students are enrolled in this batch.");
      return;
    }
    if (summary.unmarked > 0) {
      appToast.error("Please mark attendance for all students before saving.");
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
      appToast.success(
        sheetQuery.data?.hasExisting
          ? "Attendance updated successfully"
          : "Attendance saved successfully",
      );
      onSaved();
      onClose();
    } catch (error) {
      appToast.error(
        userFacingApiMessage(
          parseBranchOpsError(error),
          "Unable to save attendance. Please try again.",
        ),
      );
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
              placeholder={
                sessionsQuery.loading ? "Loading sessions..." : "Select session"
              }
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
              <Meta label="Date" value={formatAttendanceDisplayDate(date)} />
              <Meta
                label="Branch"
                value={sheetQuery.data?.branch.branchName ?? "—"}
              />
              <Meta
                label="Batch"
                value={
                  selectedBatch
                    ? `${selectedBatch.name} (${selectedBatch.code})`
                    : (sheetQuery.data?.batch.name ?? "—")
                }
              />
              <Meta label="Session" value={selectedSession.label} />
              <Meta label="Course" value={selectedSession.course.title} />
            </div>
          </div>
        ) : null}

        {batchId && batchCourseId ? (
          sheetQuery.loading ? (
            <p className="text-sm text-slate-500">Loading enrolled students...</p>
          ) : !students.length ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No students are enrolled in this batch.
            </p>
          ) : (
            <>
              {sheetQuery.data?.hasExisting ? (
                <p className="text-xs font-medium text-amber-700">
                  Attendance already marked for this session. Existing statuses
                  are loaded for editing.
                </p>
              ) : null}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student Code</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-slate-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-[#102A56]">
                        {student.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {student.studentCode}
                      </TableCell>
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

              <div className="rounded-xl border border-slate-200 bg-[#F8FBFF] p-4 text-sm">
                <p className="font-semibold text-[#102A56]">Attendance Summary</p>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                  <span>
                    Total Students:{" "}
                    <strong>{summary.total}</strong>
                  </span>
                  <span>
                    Present:{" "}
                    <strong className="text-emerald-700">{summary.present}</strong>
                  </span>
                  <span>
                    Absent:{" "}
                    <strong className="text-rose-700">{summary.absent}</strong>
                  </span>
                  <span>
                    Late:{" "}
                    <strong className="text-amber-700">{summary.late}</strong>
                  </span>
                </div>
              </div>
            </>
          )
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            Select date, batch, and session to load enrolled students.
          </p>
        )}
      </div>
    </Modal>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium text-[#102A56]">{value}</p>
    </div>
  );
}
