"use client";

import Link from "next/link";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Student } from "@/src/features/students/types/student.types";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  student: Student;
  activeSection?: string;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  actionsDisabled?: boolean;
}

export function StudentManageHeader({
  student,
  activeSection,
  onEdit,
  onArchive,
  onRestore,
  onPermanentDelete,
  actionsDisabled = false,
}: Props) {
  const isArchived = Boolean(student.deletedAt || student.isDeleted);
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ");
  const meta = student.studentCode;

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
        <span className="font-medium text-slate-700">
          {fullName} ({student.studentCode})
        </span>
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
            {fullName}
          </h1>
          {meta ? <p className="mt-1 text-sm text-slate-500">{meta}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StudentStatusBadge
              status={student.status}
              isActive={student.isActive}
              isDeleted={isArchived}
            />
          </div>
          {student.admissionDate ? (
            <p className="mt-2 text-xs text-slate-500">
              Admitted {formatStudentDate(student.admissionDate)}
            </p>
          ) : null}
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
                Permanent Delete
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
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={actionsDisabled}
                onClick={onArchive}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Archive
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
