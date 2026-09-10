"use client";

import { useEffect, useRef } from "react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

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
  onRestore?: (student: StudentListItem) => void;
  onPermanentDelete?: (student: StudentListItem) => void;
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
  onRestore,
  onPermanentDelete,
}: Props) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedStudentIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = students.map((student) => student.id);
  const columnCount = selectionEnabled ? 7 : 6;
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

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            {selectionEnabled ? (
              <th className="w-9 !px-6 !py-4 text-left">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300"
                  checked={allVisibleSelected}
                  disabled={selectionDisabled}
                  onChange={(event) => {
                    toggleAllVisible(event.target.checked);
                  }}
                  aria-label="Select all students on this page"
                />
              </th>
            ) : null}
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Student Code
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Student
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Email
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Phone
            </th>
            <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
            </th>
            <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {students.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="!px-4 !py-4 align-middle"
              >
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold">{emptyTitle}</h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    {emptyDescription}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            students.map((student) => {
              const isArchived = isArchivedStudent(student);

              return (
                <tr
                  key={student.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    isArchived ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  {selectionEnabled ? (
                    <td className="!px-6 !py-4 align-middle">
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

                  <td className="!px-4 !py-4 align-middle font-mono text-sm text-slate-700">
                    {student.studentCode}
                  </td>

                  <td className="!px-4 !py-4 align-middle text-sm font-medium leading-snug text-[#102A56]">
                    {formatStudentName(student)}
                  </td>

                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {student.email ?? "—"}
                  </td>

                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {student.phone ?? "—"}
                  </td>

                  <td className="!px-4 !py-4 align-middle">
                    <StudentStatusBadge
                      status={student.status}
                      isActive={student.isActive}
                      isDeleted={isArchived}
                    />
                  </td>

                  <td className="!px-8 !py-4 text-right align-middle">
                    <StudentRowActionsMenu
                      student={student}
                      disabled={actionsDisabled}
                      onManage={onManage}
                      onEdit={onEdit}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                      onRestore={onRestore}
                      onPermanentDelete={onPermanentDelete}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
