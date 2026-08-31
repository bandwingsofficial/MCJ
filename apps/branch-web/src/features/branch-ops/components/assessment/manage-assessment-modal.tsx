"use client";

import { useEffect, useMemo, useState } from "react";

import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  AssessmentGroupDetail,
  AssessmentItem,
} from "@/src/features/branch-ops/types";
import { formatAttendanceDisplayDate } from "@/src/features/branch-ops/utils/attendance-date.utils";
import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Input } from "@/src/shared/components/ui/input";
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
import { cn } from "@/src/shared/lib/cn";
import { appToast } from "@/src/shared/lib/toast";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="truncate text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

interface Props {
  open: boolean;
  record: AssessmentItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ManageAssessmentModal({
  open,
  record,
  onClose,
  onSaved,
}: Props) {
  const [group, setGroup] = useState<AssessmentGroupDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [maxMarks, setMaxMarks] = useState("");
  const [name, setName] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [markErrors, setMarkErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !record) {
      setGroup(null);
      return;
    }

    if (!record.assessmentGroupId) {
      setGroup(null);
      setName(record.name);
      setMaxMarks(String(record.maxMarks));
      setMarks({ [record.student.id]: String(record.obtainedMarks) });
      setMarkErrors({});
      return;
    }

    let cancelled = false;
    setLoading(true);
    branchOpsApi
      .assessmentGroup(record.assessmentGroupId)
      .then((result) => {
        if (cancelled) return;
        setGroup(result);
        setName(result.name);
        setMaxMarks(String(result.maxMarks));
        const next: Record<string, string> = {};
        for (const row of result.marks) {
          next[row.student.id] = String(row.obtainedMarks);
        }
        setMarks(next);
        setMarkErrors({});
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        appToast.error(
          userFacingApiMessage(
            parseBranchOpsError(error),
            "Unable to load assessment details.",
          ),
        );
        onClose();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, record, onClose]);

  const maxMarksValue = Number(maxMarks);
  const students = group?.marks ?? (record ? [{ student: record.student }] : []);

  const validateMark = (value: string): string | null => {
    if (!value.trim()) return "Marks are required";
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return "Enter a valid number";
    if (numeric < 0) return "Marks cannot be negative";
    if (!Number.isFinite(maxMarksValue) || maxMarksValue <= 0) {
      return "Maximum marks must be greater than zero";
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

  const canSave = useMemo(() => {
    if (!record) return false;
    if (Object.keys(markErrors).length) return false;
    if (!name.trim()) return false;
    if (!Number.isFinite(maxMarksValue) || maxMarksValue <= 0) return false;
    return true;
  }, [record, markErrors, name, maxMarksValue]);

  const save = async () => {
    if (!record) return;

    const nextErrors: Record<string, string> = {};
    const records: Array<{ studentId: string; obtainedMarks: number }> = [];

    for (const row of students) {
      const studentId = row.student.id;
      const raw = marks[studentId]?.trim() ?? "";
      const error = validateMark(raw);
      if (error) {
        nextErrors[studentId] = error;
        continue;
      }
      records.push({ studentId, obtainedMarks: Number(raw) });
    }

    if (Object.keys(nextErrors).length) {
      setMarkErrors(nextErrors);
      appToast.error("Please fix invalid marks before saving.");
      return;
    }

    try {
      setSaving(true);

      if (record.assessmentGroupId) {
        await branchOpsApi.updateAssessmentGroup(record.assessmentGroupId, {
          name: name.trim(),
          maxMarks: maxMarksValue,
          records,
        });
      } else {
        await branchOpsApi.updateAssessment(record.id, {
          name: name.trim(),
          maxMarks: maxMarksValue,
          obtainedMarks: records[0]?.obtainedMarks,
        });
      }

      appToast.success("Assessment updated successfully");
      onSaved();
      onClose();
    } catch (error) {
      appToast.error(
        userFacingApiMessage(
          parseBranchOpsError(error),
          "Unable to update assessment. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const context = group ?? record;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Assessment"
      contentClassName="max-w-5xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving || !canSave}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </>
      }
    >
      {!record ? (
        <EmptyState title="No assessment record selected." />
      ) : loading ? (
        <Loader />
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Type" value={context?.type ?? record.type} />
              <Detail
                label="Date"
                value={formatAttendanceDisplayDate(
                  String(context?.date ?? record.date),
                )}
              />
              <Detail
                label="Batch"
                value={
                  context?.batch?.code
                    ? `${context.batch.name} (${context.batch.code})`
                    : record.batch.name
                }
              />
              <Detail
                label="Session"
                value={context?.session?.label ?? record.session?.label ?? "—"}
              />
              <Detail
                label="Course"
                value={
                  context?.course?.title ?? record.course?.title ?? "—"
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Assessment Name
              </label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
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
                {students.map((row) => (
                  <TableRow key={row.student.id}>
                    <TableCell className="font-medium text-[#102A56]">
                      {row.student.name}
                    </TableCell>
                    <TableCell>{row.student.studentCode}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max={maxMarksValue || undefined}
                        value={marks[row.student.id] ?? ""}
                        onChange={(event) =>
                          updateMark(row.student.id, event.target.value)
                        }
                        className={cn(markErrors[row.student.id] && "border-red-400")}
                      />
                      {markErrors[row.student.id] ? (
                        <p className="mt-1 text-xs text-red-600">
                          {markErrors[row.student.id]}
                        </p>
                      ) : null}
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
