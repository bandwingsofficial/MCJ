"use client";

import { useEffect, useMemo, useState } from "react";

import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  AssessmentSheetStudent,
  AttendanceSessionOption,
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

const ASSESSMENT_TYPES = [
  "TEST",
  "PRESENTATION",
  "ASSIGNMENT",
  "PRACTICAL",
  "OTHER",
] as const;

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
  const [type, setType] = useState<(typeof ASSESSMENT_TYPES)[number]>("TEST");
  const [date, setDate] = useState(todayInputValue());
  const [batchId, setBatchId] = useState("");
  const [batchCourseId, setBatchCourseId] = useState("");
  const [name, setName] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [markErrors, setMarkErrors] = useState<Record<string, string>>({});
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
      batchId && batchCourseId
        ? branchOpsApi.assessmentSheet({ batchId, batchCourseId })
        : Promise.resolve(null),
    [batchId, batchCourseId],
  );

  useEffect(() => {
    if (!open) return;
    setType("TEST");
    setDate(todayInputValue());
    setBatchId("");
    setBatchCourseId("");
    setName("");
    setMaxMarks("100");
    setMarks({});
    setMarkErrors({});
  }, [open]);

  useEffect(() => {
    setBatchCourseId("");
    setMarks({});
    setMarkErrors({});
  }, [batchId]);

  useEffect(() => {
    setMarks({});
    setMarkErrors({});
  }, [batchCourseId]);

  const students: AssessmentSheetStudent[] = sheetQuery.data?.students ?? [];
  const selectedSession =
    sessionsQuery.data?.find((item) => item.batchCourseId === batchCourseId) ??
    null;
  const selectedBatch =
    selectableBatches.find((batch) => batch.id === batchId) ?? null;

  const maxMarksValue = Number(maxMarks);

  const summary = useMemo(() => {
    const entered = students.filter((student) => {
      const value = marks[student.id]?.trim();
      return value !== undefined && value !== "";
    }).length;
    return {
      total: students.length,
      entered,
      notEntered: students.length - entered,
    };
  }, [marks, students]);

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
    if (!batchId) {
      appToast.error("Please select a batch.");
      return;
    }
    if (!batchCourseId) {
      appToast.error("Please select a session.");
      return;
    }
    if (!name.trim()) {
      appToast.error("Please enter an assessment name.");
      return;
    }
    if (!Number.isFinite(maxMarksValue) || maxMarksValue <= 0) {
      appToast.error("Maximum marks must be greater than zero.");
      return;
    }
    if (!students.length) {
      appToast.error("No students are enrolled in this batch.");
      return;
    }

    const records: Array<{ studentId: string; obtainedMarks: number }> = [];
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
        batchCourseId,
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

  const canShowMarks =
    Boolean(batchId && batchCourseId && name.trim() && maxMarksValue > 0);

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
              !batchId ||
              !batchCourseId ||
              !name.trim() ||
              !students.length ||
              summary.entered === 0 ||
              Object.keys(markErrors).length > 0
            }
          >
            {saving ? "Saving..." : "Save Assessment"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Assessment Type
            </label>
            <AppSelect
              value={type}
              onValueChange={(value) =>
                setType(value as (typeof ASSESSMENT_TYPES)[number])
              }
              options={ASSESSMENT_TYPES.map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </div>
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
        </div>

        {batchId && batchCourseId && selectedSession ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <Meta label="Type" value={type} />
              <Meta label="Date" value={formatAttendanceDisplayDate(date)} />
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

        {canShowMarks ? (
          sheetQuery.loading ? (
            <p className="text-sm text-slate-500">Loading enrolled students...</p>
          ) : !students.length ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No students are enrolled in this batch.
            </p>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <p className="font-medium text-[#102A56]">{name.trim()}</p>
                <p className="text-xs text-slate-500">
                  {type} · Maximum marks: {maxMarksValue}
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Student Code</TableHead>
                      <TableHead className="w-[140px]">Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-[#102A56]">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.studentCode}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>Total Students: {summary.total}</span>
                <span>Marks Entered: {summary.entered}</span>
                <span>Not Entered: {summary.notEntered}</span>
              </div>
            </>
          )
        ) : null}
      </div>
    </Modal>
  );
}
