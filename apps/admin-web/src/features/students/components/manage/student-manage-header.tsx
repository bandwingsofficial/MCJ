"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Archive,
  ChevronRight,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type { Student } from "@/src/features/students/types/student.types";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import {
  formatStudentName,
  getStudentInitials,
} from "@/src/features/students/utils/student-overview.utils";

interface Props {
  student: Student;
  activeSection?: string;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  actionsDisabled?: boolean;
}

function displayValue(value?: string | null) {
  if (!value?.trim()) {
    return "—";
  }

  return value.trim();
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
  const fullName = formatStudentName(student.firstName, student.lastName);

  const moreItems = isArchived
    ? [
        {
          label: "Restore",
          onClick: onRestore,
        },
        {
          label: "Permanently Delete",
          onClick: onPermanentDelete,
          destructive: true,
        },
      ]
    : [{ label: "Archive", onClick: onArchive, destructive: true }];

  return (
    <div className="space-y-3">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-xs"
      >
        <Link
          href="/students"
          className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          Students
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-700">{student.studentCode}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-[#102A56]">Management</span>
        {activeSection ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="shrink-0">
              {student.profileImageUrl ? (
                <Image
                  src={student.profileImageUrl}
                  alt={fullName}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl border border-[#DCE8F5] object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[#DCE8F5] bg-gradient-to-br from-violet-50 to-[#F8FBFF] text-lg font-semibold text-violet-700">
                  {getStudentInitials(student.firstName, student.lastName)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="min-w-0 text-xl font-bold tracking-tight text-[#102A56] sm:text-2xl">
                  {fullName}
                </h1>
                <StudentStatusBadge
                  status={student.status}
                  isActive={student.isActive}
                  isDeleted={isArchived}
                />
              </div>

              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Student Code
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-[#102A56]">
                    {student.studentCode}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Email
                  </dt>
                  <dd className="mt-0.5 truncate text-sm font-medium text-[#102A56]">
                    {displayValue(student.email)}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2 sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Phone
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                    {displayValue(student.phone)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:min-w-[180px] lg:items-end">
            {!isArchived ? (
              <Button
                type="button"
                size="sm"
                disabled={actionsDisabled}
                onClick={onEdit}
                className="h-11 justify-center border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
              >
                <Pencil className="mr-1.5 h-4 w-4 shrink-0" />
                Edit Student
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  disabled={actionsDisabled}
                  onClick={onRestore}
                  className="h-9 justify-center border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                >
                  <RotateCcw className="mr-1.5 h-4 w-4 shrink-0" />
                  Restore
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={actionsDisabled}
                  onClick={onPermanentDelete}
                  className="h-9 justify-center"
                >
                  <Trash2 className="mr-1.5 h-4 w-4 shrink-0" />
                  Permanently Delete
                </Button>
              </>
            )}

            {!isArchived ? (
              <Dropdown
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={actionsDisabled}
                    aria-label="More student actions"
                    className="h-9 justify-center border-amber-200 text-amber-800 hover:bg-amber-50"
                  >
                    <Archive className="mr-1.5 h-4 w-4 shrink-0" />
                    More
                  </Button>
                }
                items={moreItems}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
