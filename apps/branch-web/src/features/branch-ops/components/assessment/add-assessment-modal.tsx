"use client";

import { useEffect, useMemo, useState } from "react";

import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  ASSESSMENT_REMARK_OPTIONS,
  ASSESSMENT_TYPES,
  type AssessmentTypeValue,
} from "@/src/features/branch-ops/constants/assessment.constants";
import type {
  AssessmentSheetStudent,
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

function todayInputValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="truncate text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  batches: BatchListItem[];
}

export function AddAssessmentModal({
  open,
  onClose,
  onSaved,
  batches,
}: Props) {
  const [date, setDate] = useState(todayInputValue());
  const [name, setName] = useState("");
  const [type, setType] = useState<AssessmentTypeValue>("TEST");
  const [batchId, setBatchId] = useState("");
  const [mode, setMode] = useState<BatchMode | "">("");
  const [batchTimingId, setBatchTimingId] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [markErrors, setMarkErrors] = useState<Record<string, string>>({});
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
    return (
      (selectedBatch.timings ?? []).find((timing) => timing.id === batchTimingId) ??
      null
    );
  }, [batchTimingId, selectedBatch]);

  const sheetQuery = useAsyncData(
    () =>
      batchId && batchTimingId
        ? branchOpsApi.assessmentSheet({ batchId, batchTimingId })
        : Promise.resolve(null),
    [batchId, batchTimingId],
  );

  useEffect(() => {
    if (!open) return;
    setDate(todayInputValue());
    setName("");
    setType("TEST");
    setBatchId("");
    setMode("");
    setBatchTimingId("");
    setMaxMarks("100");
    setMarks({});
    setRemarks({});
    setMarkErrors({});
  }, [open]);

  useEffect(() => {
    setMode("");
    setBatchTimingId("");
    setMarks({});
    setRemarks({});
    setMarkErrors({});
  }, [batchId]);

  useEffect(() => {
    setBatchTimingId("");
    setMarks({});
    setRemarks({});
    setMarkErrors({});
  }, [mode]);

  useEffect(() => {
    setMarks({});
    setRemarks({});
    setMarkErrors({});
  }, [batchTimingId]);

  const students: AssessmentSheetStudent[] = sheetQuery.data?.students ?? [];
  const maxMarksValue = Number(maxMarks);
  const selectionComplete = Boolean(batchId && mode && batchTimingId);
  const canShowStudents =
    selectionComplete &&
    Boolean(name.trim()) &&
    Number.isFinite(maxMarksValue) &&
    maxMarksValue > 0;

  const sheet = sheetQuery.data;

  const validateMark = (value: string): string | null => {
    if (!value.trim()) return null;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return "Enter a valid number";
    if (numeric < 0) return "Marks cannot be negative";
    if (!Number.isFinite(maxMarksValue) || maxMarksValue <= 0) {
      return "Set maximum marks first";
    }
    if (numeric > maxMarksValue) {
      return "Obtained marks cannot exceed maximum marks";
    }
    return null;
  };

  const updateMark = (studentId: string, value: string) => {
    setMarks((prev) => ({ ...prev, [studentId]: value }));
    const error = validateMark(value);
    setMarkErrors((prev) => {
      const next = { ...prev };
      if (error) next[studentId] = error;
      else delete next[studentId];
      return next;
    });
  };

  const save = async () => {
    if (!date) {
      appToast.error("Please select an assessment date.");
      return;
    }
    if (!name.trim()) {
      appToast.error("Please enter an assessment name.");
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
    if (!Number.isFinite(maxMarksValue) || maxMarksValue <= 0) {
      appToast.error("Maximum marks must be greater than zero.");
      return;
    }
    if (!students.length) {
      appToast.error("No students are enrolled in this batch timing.");
      return;
    }

    const records: Array<{
      studentId: string;
      obtainedMarks: number;
      remarks?: string;
    }> = [];
    const nextErrors: Record<string, string> = {};

    for (const student of students) {
      const raw = marks[student.id]?.trim() ?? "";
      if (!raw) continue;
      const error = validateMark(raw);
      if (error) {
        nextErrors[student.id] = error;
        continue;
      }
      records.push({
        studentId: student.id,
        obtainedMarks: Number(raw),
        remarks: remarks[student.id]?.trim() || undefined,
      });
    }

    if (Object.keys(nextErrors).length) {
      setMarkErrors(nextErrors);
      appToast.error("Please fix invalid marks before saving.");
      return;
    }

    if (!records.length) {
      appToast.error("Enter marks for at least one student.");
      return;
    }

    try {
      setSaving(true);
      await branchOpsApi.createAssessmentBulk({
        batchId,
        batchTimingId,
        type,
        name: name.trim(),
        date,
        maxMarks: maxMarksValue,
        records,
      });
      appToast.success("Assessment saved successfully");
      onSaved();
      onClose();
    } catch (error) {
      appToast.error(
        userFacingApiMessage(
          parseBranchOpsError(error),
          "Unable to save assessment. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const enteredCount = students.filter((student) =>
    Boolean(marks[student.id]?.trim()),
  ).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Assessment"
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
              !name.trim() ||
              !students.length ||
              enteredCount === 0 ||
              Object.keys(markErrors).length > 0
            }
          >
            {saving ? "Saving..." : "Save Assessment"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Assessment Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Assessment Name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Written Test - Chapter 1"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Assessment Type
            </label>
            <AppSelect
              value={type}
              onValueChange={(value) => setType(value as AssessmentTypeValue)}
              options={ASSESSMENT_TYPES.map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Main Batch
            </label>
            <AppSelect
              value={batchId || undefined}
              placeholder="Select batch"
              onValueChange={setBatchId}
              options={batchDropdownOptions}
            />
            {!selectableBatches.length ? (
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
              placeholder={batchId ? "Select mode" : "Select batch first"}
              onValueChange={(value) => setMode(value as BatchMode)}
              options={modeOptions}
              disabled={!batchId}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Batch Timing
            </label>
            <AppSelect
              value={batchTimingId || undefined}
              placeholder={mode ? "Select timing" : "Select mode first"}
              onValueChange={setBatchTimingId}
              options={timingOptions}
              disabled={!mode}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Maximum Marks
            </label>
            <Input
              type="number"
              step="0.5"
              min="0.01"
              value={maxMarks}
              onChange={(event) => setMaxMarks(event.target.value)}
            />
          </div>
        </div>

        {canShowStudents && sheet ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Meta label="Branch" value={sheet.branch.branchName} />
              <Meta
                label="Assessment Date"
                value={formatAttendanceDisplayDate(date)}
              />
              <Meta label="Assessment Name" value={name.trim()} />
              <Meta label="Assessment Type" value={type} />
              <Meta
                label="Batch"
                value={`${sheet.batch.name} (${sheet.batch.code})`}
              />
              <Meta
                label="Learning Mode"
                value={selectedTiming ? getBatchModeSectionLabel(selectedTiming.mode) : mode}
              />
              <Meta label="Batch Timing" value={selectedTiming?.name ?? "—"} />
              <Meta
                label="Course"
                value={sheet.course?.title ?? sheet.session.course.title}
              />
              <Meta label="Maximum Marks" value={String(maxMarksValue)} />
              <Meta label="Student Count" value={String(students.length)} />
            </div>
          </div>
        ) : null}

        {!selectionComplete ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            Select main batch, learning mode, and batch timing to load enrolled
            students.
          </p>
        ) : !canShowStudents ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            Enter assessment name and maximum marks to load the student list.
          </p>
        ) : sheetQuery.loading ? (
          <p className="text-sm text-slate-500">Loading enrolled students...</p>
        ) : !students.length ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            No students are enrolled in this batch timing.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Code</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-[140px]">Obtained Marks</TableHead>
                    <TableHead className="min-w-[180px]">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-xs">
                        {student.studentCode}
                      </TableCell>
                      <TableCell className="font-medium text-[#102A56]">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max={maxMarksValue}
                          value={marks[student.id] ?? ""}
                          onChange={(event) =>
                            updateMark(student.id, event.target.value)
                          }
                          className={cn(
                            markErrors[student.id] && "border-red-400",
                          )}
                          placeholder="—"
                        />
                        {markErrors[student.id] ? (
                          <p className="mt-1 text-xs text-red-600">
                            {markErrors[student.id]}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <AppSelect
                          value={remarks[student.id] || undefined}
                          placeholder="Select remark"
                          onValueChange={(value) =>
                            setRemarks((prev) => ({
                              ...prev,
                              [student.id]: value,
                            }))
                          }
                          options={ASSESSMENT_REMARK_OPTIONS.map((option) => ({
                            label: option.label,
                            value: option.value,
                          }))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span>Total Students: {students.length}</span>
              <span>Marks Entered: {enteredCount}</span>
              <span>Not Entered: {students.length - enteredCount}</span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
