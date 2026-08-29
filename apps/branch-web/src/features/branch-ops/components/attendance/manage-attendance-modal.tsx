"use client";

import { useEffect, useMemo, useState } from "react";

import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { AttendanceItem } from "@/src/features/branch-ops/types";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
  formatAttendanceMarkedAt,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
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

const MARK_STATUSES = ["PRESENT", "ABSENT", "LATE"] as const;
type MarkStatus = (typeof MARK_STATUSES)[number];

interface Props {
  open: boolean;
  record: AttendanceItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="truncate text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

export function ManageAttendanceModal({
  open,
  record,
  onClose,
  onSaved,
}: Props) {
  const [status, setStatus] = useState<MarkStatus>("PRESENT");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<AttendanceItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!open || !record) return;
    setStatus(
      record.status === "PRESENT" ||
        record.status === "ABSENT" ||
        record.status === "LATE"
        ? record.status
        : "PRESENT",
    );
  }, [open, record]);

  useEffect(() => {
    if (!open || !record) {
      setHistory([]);
      return;
    }

    let cancelled = false;
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await branchOpsApi.attendanceReport({
          studentId: record.student.id,
          batchId: record.batch.id,
          take: 100,
        });
        if (!cancelled) {
          setHistory(response.items ?? []);
        }
      } catch {
        if (!cancelled) {
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [open, record]);

  const canSave = useMemo(() => {
    if (!record) return false;
    return status !== record.status;
  }, [record, status]);

  const save = async () => {
    if (!record) return;
    try {
      setSaving(true);
      await branchOpsApi.saveAttendance({
        batchId: record.batch.id,
        batchCourseId: record.session.batchCourseId,
        studentId: record.student.id,
        date: String(record.date).slice(0, 10),
        status,
      });
      appToast.success("Attendance updated");
      onSaved();
      onClose();
    } catch (error) {
      appToast.error(
        userFacingApiMessage(
          parseBranchOpsError(error),
          "Unable to update attendance. Please try again.",
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
      title="Attendance Details"
      contentClassName="max-w-3xl"
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
        <EmptyState title="No attendance record selected." />
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail
                label="Student"
                value={`${record.student.name} · ${record.student.studentCode}`}
              />
              <Detail
                label="Branch"
                value={record.branch?.branchName ?? "—"}
              />
              <Detail
                label="Batch"
                value={
                  record.batch.code
                    ? `${record.batch.name} (${record.batch.code})`
                    : record.batch.name
                }
              />
              <Detail label="Session" value={record.session.label} />
              <Detail label="Course" value={record.course.title} />
              <Detail
                label="Attendance Date"
                value={formatAttendanceDisplayDate(String(record.date))}
              />
              <Detail label="Current Status" value={record.status} />
              <Detail
                label="Marked At"
                value={formatAttendanceMarkedAt(
                  record.markedAt ?? record.updatedAt ?? record.createdAt,
                )}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Change status
            </p>
            <div className="flex flex-wrap gap-2">
              {MARK_STATUSES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    status === option
                      ? option === "PRESENT"
                        ? "bg-emerald-600 text-white"
                        : option === "ABSENT"
                          ? "bg-rose-600 text-white"
                          : "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#102A56]">
              Student Attendance History
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Records for {record.student.name} in {record.batch.name}
            </p>
            {historyLoading ? (
              <Loader />
            ) : !history.length ? (
              <EmptyState title="No attendance history for this batch." />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {formatAttendanceDisplayDate(String(item.date))}
                        </TableCell>
                        <TableCell>
                          {item.session.sessionNumber != null
                            ? `Session ${item.session.sessionNumber}`
                            : item.session.label}
                        </TableCell>
                        <TableCell>{item.course.title}</TableCell>
                        <TableCell>
                          <Badge variant={attendanceStatusVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
