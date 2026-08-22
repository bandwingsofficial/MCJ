"use client";

import Link from "next/link";
import {
  CircleCheck,
  MoreVertical,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type { Student } from "@/src/features/students/types/student.types";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import { formatStudentName } from "@/src/features/students/utils/student-overview.utils";

interface Props {
  student: Student;
  activeSection?: string;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  actionsDisabled?: boolean;
}

function buildMetaLine(student: Student): string {
  return [student.studentCode, student.email, student.phone]
    .filter((value) => Boolean(value?.trim()))
    .join(" · ");
}

export function StudentManageHeader({
  student,
  activeSection,
  onEdit,
  onActivate,
  onDeactivate,
  onArchive,
  onRestore,
  onPermanentDelete,
  actionsDisabled = false,
}: Props) {
  const isArchived = Boolean(student.deletedAt || student.isDeleted);
  const metaLine = buildMetaLine(student);

  const moreItems = isArchived
    ? [
        {
          label: "Restore",
          onClick: onRestore,
        },
        {
          label: "Permanent Delete",
          onClick: onPermanentDelete,
          destructive: true,
        },
      ]
    : [
        { label: "Edit", onClick: onEdit },
        { label: "Archive", onClick: onArchive, destructive: true },
      ];

  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/students"
          className="font-medium text-[#2447A8] hover:underline"
        >
          Students
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-700">{student.studentCode}</span>
        <span aria-hidden>›</span>
        <span className="text-slate-900">Management</span>
        {activeSection ? (
          <>
            <span aria-hidden>›</span>
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {formatStudentName(student.firstName, student.lastName)}
          </h1>
          {metaLine ? (
            <p className="mt-1 text-sm text-slate-500">{metaLine}</p>
          ) : null}
          <div className="mt-2">
            <StudentStatusBadge
              status={student.status}
              isActive={student.isActive}
              isDeleted={isArchived}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isArchived ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={actionsDisabled}
                onClick={onRestore}
                className="border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Restore
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={actionsDisabled}
                onClick={onPermanentDelete}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Permanently Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={actionsDisabled}
                onClick={onEdit}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit Student
              </Button>

              {student.isActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={actionsDisabled}
                  onClick={onDeactivate}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Power className="mr-1.5 h-3.5 w-3.5" />
                  Deactivate
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={actionsDisabled}
                  onClick={onActivate}
                  className="border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                >
                  <CircleCheck className="mr-1.5 h-3.5 w-3.5" />
                  Activate
                </Button>
              )}

              <Dropdown
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={actionsDisabled}
                    aria-label="More student actions"
                  >
                    <MoreVertical className="mr-1.5 h-3.5 w-3.5" />
                    More
                  </Button>
                }
                items={moreItems}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
