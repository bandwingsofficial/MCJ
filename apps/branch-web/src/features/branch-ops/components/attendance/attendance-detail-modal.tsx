"use client";

import { useMemo, useState } from "react";

import type { AttendanceItem } from "@/src/features/branch-ops/types";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

function formatDisplayDate(value: string) {
  const raw = value?.toString().slice(0, 10);
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusVariant(status: string) {
  if (status === "PRESENT") return "success" as const;
  if (status === "ABSENT") return "danger" as const;
  if (status === "LATE") return "warning" as const;
  return "default" as const;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  items: AttendanceItem[];
}

export function AttendanceDetailModal({
  open,
  onClose,
  title = "Attendance details",
  items,
}: Props) {
  const summary = useMemo(() => {
    return {
      present: items.filter((item) => item.status === "PRESENT").length,
      absent: items.filter((item) => item.status === "ABSENT").length,
      late: items.filter((item) => item.status === "LATE").length,
      leave: items.filter((item) => item.status === "LEAVE").length,
      total: items.length,
    };
  }, [items]);

  const context = items[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      contentClassName="max-w-4xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {context ? (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Date</p>
              <p className="font-medium text-[#102A56]">
                {formatDisplayDate(String(context.date))}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Branch</p>
              <p className="font-medium text-[#102A56]">
                {context.branch?.branchName ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Batch</p>
              <p className="font-medium text-[#102A56]">{context.batch.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Session</p>
              <p className="font-medium text-[#102A56]">
                {context.session.label}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span>Present: {summary.present}</span>
            <span>Absent: {summary.absent}</span>
            <span>Late: {summary.late}</span>
            <span>Total: {summary.total}</span>
          </div>
        </div>
      ) : null}

      {!items.length ? (
        <p className="text-sm text-[#647A9B]">No attendance records.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.student.name}</TableCell>
                <TableCell className="font-mono text-xs">
                  {item.student.studentCode}
                </TableCell>
                <TableCell>{item.course.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Modal>
  );
}

export function useAttendanceDetailState() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [title, setTitle] = useState("Attendance details");

  return {
    open,
    items,
    title,
    openWith: (nextItems: AttendanceItem[], nextTitle?: string) => {
      setItems(nextItems);
      setTitle(nextTitle ?? "Attendance details");
      setOpen(true);
    },
    close: () => setOpen(false),
  };
}
