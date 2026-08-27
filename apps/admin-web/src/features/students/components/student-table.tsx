"use client";

import { useEffect, useRef } from "react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
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
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
          <tr>
            {selectionEnabled ? (
              <th className="w-11 px-3 py-3 text-left">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={allVisibleSelected}
                  disabled={selectionDisabled}
                  onChange={(event) => {
                    toggleAllVisible(event.target.checked);
                  }}
                  aria-label="Select all students on this page"
                />
              </th>
            ) : null}
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student Code
            </th>
            <th className="min-w-[180px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student
            </th>
            <th className="min-w-[180px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </th>
            <th className="min-w-[120px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Phone
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="w-[7.5rem] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {students.map((student) => {
            const isArchived = isArchivedStudent(student);

            return (
              <tr
                key={student.id}
                className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                  isArchived ? "bg-slate-50/40" : "bg-white"
                }`}
              >
                {selectionEnabled ? (
                  <td className="w-11 px-3 py-3 align-middle">
                    <Checkbox
                      checked={safeSelectedIds.includes(student.id)}
                      disabled={selectionDisabled}
                      onCheckedChange={(checked) =>
                        toggleRow(student.id, Boolean(checked))
                      }
                      aria-label={`Select ${formatStudentName(student)}`}
                    />
                  </td>
                ) : null}

                <td className="px-3 py-3 align-middle font-mono text-[15px] text-slate-700">
                  {student.studentCode}
                </td>

                <td className="px-3 py-3 align-middle text-[15px] font-medium text-slate-900">
                  {formatStudentName(student)}
                </td>

                <td className="px-3 py-3 align-middle text-[15px] text-slate-700">
                  {student.email ?? "—"}
                </td>

                <td className="px-3 py-3 align-middle text-[15px] text-slate-700">
                  {student.phone ?? "—"}
                </td>

                <td className="px-3 py-3 align-middle">
                  <StudentStatusBadge
                    status={student.status}
                    isActive={student.isActive}
                    isDeleted={isArchived}
                  />
                </td>

                <td className="px-2 py-3 text-right align-middle">
                  <StudentRowActionsMenu
                    student={student}
                    disabled={actionsDisabled}
                    onManage={onManage}
                    onEdit={onEdit}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
