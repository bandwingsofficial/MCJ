"use client";

import { useEffect, useRef } from "react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

import type { StudentListItem } from "@/src/features/students/types/student.types";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";

import { StudentStatusBadge } from "./StudentStatusBadge";
import { StudentRowActionsMenu } from "./student-row-actions-menu";

interface Props {
  students: StudentListItem[];
  selectedStudentIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onManage: (student: StudentListItem) => void;
  onEdit: (student: StudentListItem) => void;
  onActivate: (student: StudentListItem) => void;
  onDeactivate: (student: StudentListItem) => void;
}

function formatStudentName(student: StudentListItem): string {
  return [student.firstName, student.lastName].filter(Boolean).join(" ");
}

export function StudentTable({
  students,
  selectedStudentIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  emptyTitle = "No Students Yet",
  emptyDescription = "Create your first student to get started.",
  onManage,
  onEdit,
  onActivate,
  onDeactivate,
}: Props) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedStudentIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = students.map((student) => student.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleRow = (studentId: string, checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    const next = checked
      ? Array.from(new Set([...safeSelectedIds, studentId]))
      : safeSelectedIds.filter((id) => id !== studentId);

    onSelectionChange(next);
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    if (!checked) {
      onSelectionChange(
        safeSelectedIds.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    onSelectionChange(
      Array.from(new Set([...safeSelectedIds, ...visibleIds])),
    );
  };

  if (students.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <Table className="rounded-none border-0">
      <TableHeader>
        <TableRow>
          {selectionEnabled ? (
            <TableHead className="w-10">
              <Checkbox
                checked={allVisibleSelected}
                disabled={selectionDisabled}
                onCheckedChange={(checked) =>
                  toggleAllVisible(Boolean(checked))
                }
                aria-label="Select all students on this page"
              />
            </TableHead>
          ) : null}
          <TableHead>Student Code</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            {selectionEnabled ? (
              <TableCell>
                <Checkbox
                  checked={safeSelectedIds.includes(student.id)}
                  disabled={selectionDisabled}
                  onCheckedChange={(checked) =>
                    toggleRow(student.id, Boolean(checked))
                  }
                  aria-label={`Select ${formatStudentName(student)}`}
                />
              </TableCell>
            ) : null}

            <TableCell className="font-mono text-[15px] text-slate-700">
              {student.studentCode}
            </TableCell>

            <TableCell className="text-[15px] font-medium text-slate-900">
              {formatStudentName(student)}
            </TableCell>

            <TableCell className="text-[15px] text-slate-700">
              {student.email ?? "—"}
            </TableCell>

            <TableCell className="text-[15px] text-slate-700">
              {student.phone ?? "—"}
            </TableCell>

            <TableCell>
              <StudentStatusBadge
                status={student.status}
                isActive={student.isActive}
                isDeleted={isArchivedStudent(student)}
              />
            </TableCell>

            <TableCell className="text-right">
              <StudentRowActionsMenu
                student={student}
                disabled={actionsDisabled}
                onManage={onManage}
                onEdit={onEdit}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
