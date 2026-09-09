"use client";

import { useEffect, useMemo, useState } from "react";

import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  AttendanceSheetStudent,
  BatchListItem,
} from "@/src/features/branch-ops/types";
import {
  BLOCKED_BATCH_SELECTION_MESSAGE,
  isBatchNotYetStarted,
  isBatchSelectableForAssignment,
} from "@/src/features/branch-ops/utils/batch-selection.utils";
import { formatAttendanceDisplayDate } from "@/src/features/branch-ops/utils/attendance-date.utils";
import {
  getBatchModeSectionLabel,
  getConfiguredBatchModes,
  getTimingsForMode,
  type BatchMode,
} from "@/src/features/branch-ops/utils/batch-mode.utils";
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
  const [mode, setMode] = useState<BatchMode | "">("");
  const [batchTimingId, setBatchTimingId] = useState("");
  const [statuses, setStatuses] = useState<Record<string, MarkStatus | "">>(
    {},
  );
  const [saving, setSaving] = useState(false);

  const assignmentBatches = useMemo(
    () => batches.filter((batch) => isBatchSelectableForAssignment(batch)),
    [batches],
  );

  const selectableBatches = useMemo(
    () => assignmentBatches.filter((batch) => !isBatchNotYetStarted(batch)),
    [assignmentBatches],
  );

  const batchDropdownOptions = useMemo(
    () =>
      assignmentBatches.map((batch) => {
        const notStarted = isBatchNotYetStarted(batch);
        return {
          value: batch.id,
          disabled: notStarted,
          label: notStarted
            ? `${batch.name} (${batch.code}) — Not Started`
            : `${batch.name} (${batch.code})`,
        };
      }),
    [assignmentBatches],
  );

  const selectedBatch =
    selectableBatches.find((batch) => batch.id === batchId) ?? null;

  const branchInfo = useMemo(() => {
    return selectedBatch?.branch ?? selectableBatches[0]?.branch ?? null;
  }, [selectedBatch, selectableBatches]);

  const modeOptions = useMemo(() => {
    if (!selectedBatch) return [];
    return getConfiguredBatchModes(selectedBatch).map((item) => ({
      label: getBatchModeSectionLabel(item),
      value: item,
    }));
  }, [selectedBatch]);

  const timingOptions = useMemo(() => {
    if (!selectedBatch || !mode) return [];
    return getTimingsForMode(selectedBatch, mode).map((timing) => ({
      label: timing.name,
      value: timing.id,
    }));
  }, [mode, selectedBatch]);

  const selectedTiming = useMemo(() => {
    if (!selectedBatch || !batchTimingId) return null;
    return (selectedBatch.timings ?? []).find((timing) => timing.id === batchTimingId) ?? null;
  }, [batchTimingId, selectedBatch]);

  const sheetQuery = useAsyncData(
    () =>
      batchId && batchTimingId && date
        ? branchOpsApi.attendanceSheet({ batchId, batchTimingId, date })
        : Promise.resolve(null),
    [batchId, batchTimingId, date],
  );

  useEffect(() => {
    if (!open) return;
    setDate(todayInputValue());
    setBatchId("");
    setMode("");
    setBatchTimingId("");
    setStatuses({});
  }, [open]);

  useEffect(() => {
    setMode("");
    setBatchTimingId("");
    setStatuses({});
  }, [batchId]);

  useEffect(() => {
    setBatchTimingId("");
    setStatuses({});
  }, [mode]);

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

  const selectionComplete = Boolean(batchId && mode && batchTimingId);

  const save = async () => {
    if (!date) {
      appToast.error("Please select an attendance date.");
      return;
    }
    if (!batchId) {
      appToast.error("Please select a main batch.");
      return;
    }
    if (!mode) {
      appToast.error("Please select a learning mode.");
      return;
    }
    if (!batchTimingId) {
      appToast.error("Please select a batch timing.");
      return;
    }
    if (!students.length) {
      appToast.error("No students are enrolled in this batch timing.");
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
        batchTimingId,
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
              !selectionComplete ||
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
        {branchInfo ? (
          <div className="rounded-xl border border-slate-200 bg-[#F8FBFF] px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Branch
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[#102A56]">
              <span>
                <span className="text-slate-500">Name:</span>{" "}
                <span className="font-medium">{branchInfo.branchName}</span>
              </span>
              <span>
                <span className="text-slate-500">Code:</span>{" "}
                <span className="font-medium">{branchInfo.branchCode}</span>
              </span>
              {branchInfo.city ? (
                <span>
                  <span className="text-slate-500">City:</span>{" "}
                  <span className="font-medium">{branchInfo.city}</span>
                </span>
              ) : null}
              {branchInfo.phone ? (
                <span>
                  <span className="text-slate-500">Phone:</span>{" "}
                  <span className="font-medium">{branchInfo.phone}</span>
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              Main Batch
            </label>
            <AppSelect
              value={batchId || undefined}
              placeholder="Select main batch"
              onValueChange={setBatchId}
              options={batchDropdownOptions}
            />
            {!assignmentBatches.length ? (
              <p className="mt-1 text-xs text-amber-700">
                {BLOCKED_BATCH_SELECTION_MESSAGE}
              </p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Learning Mode
            </label>
            <AppSelect
              value={mode || undefined}
              placeholder="Select mode"
              onValueChange={(value) => setMode(value as BatchMode)}
              options={modeOptions}
              disabled={!batchId || !modeOptions.length}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Batch Timing
            </label>
            <AppSelect
              value={batchTimingId || undefined}
              placeholder="Select batch timing"
              onValueChange={setBatchTimingId}
              options={timingOptions}
              disabled={!batchId || !mode || !timingOptions.length}
            />
          </div>
        </div>

        {selectionComplete && sheetQuery.data ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Meta
                label="Branch"
                value={sheetQuery.data.branch.branchName}
              />
              <Meta
                label="Attendance Date"
                value={formatAttendanceDisplayDate(date)}
              />
              <Meta
                label="Main Batch"
                value={
                  selectedBatch
                    ? `${selectedBatch.name} (${selectedBatch.code})`
                    : sheetQuery.data.batch.name
                }
              />
              <Meta
                label="Learning Mode"
                value={mode ? getBatchModeSectionLabel(mode) : "—"}
              />
              <Meta
                label="Batch Timing"
                value={selectedTiming?.name ?? sheetQuery.data.timing?.name ?? "—"}
              />
              <Meta
                label="Course"
                value={sheetQuery.data.session.course.title}
              />
            </div>
          </div>
        ) : null}

        {selectionComplete ? (
          sheetQuery.loading ? (
            <p className="text-sm text-slate-500">Loading enrolled students...</p>
          ) : sheetQuery.error ? (
            <p className="text-sm text-rose-600">{sheetQuery.error}</p>
          ) : !students.length ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No admitted students are assigned to this batch timing.
            </p>
          ) : (
            <>
              {sheetQuery.data?.hasExisting ? (
                <p className="text-xs font-medium text-amber-700">
                  Attendance already marked for this batch timing. Existing
                  statuses are loaded for editing.
                </p>
              ) : null}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student Name</TableHead>
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
                    Total Students: <strong>{summary.total}</strong>
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
            Select date, main batch, learning mode, and batch timing to load
            enrolled students.
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
