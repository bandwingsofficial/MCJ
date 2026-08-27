"use client";

import Link from "next/link";
import { MoreVertical, Pencil } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type { Student } from "@/src/features/students/types/student.types";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import { formatStudentName } from "@/src/features/students/utils/student-overview.utils";

interface Props {
  student: Student;
  activeSection?: string;
  onEdit: () => void;
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
          label: "Permanently Delete",
          onClick: onPermanentDelete,
          destructive: true,
        },
      ]
    : [
        { label: "Archive", onClick: onArchive, destructive: true },
      ];

  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[#647A9B]">
        <Link
          href="/students"
          className="font-medium text-[#2563EB] hover:underline"
        >
          Students
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-700">{student.studentCode}</span>
        <span aria-hidden>›</span>
        <span className="text-[#102A56]">Management</span>
        {activeSection ? (
          <>
            <span aria-hidden>›</span>
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-[#102A56] sm:text-2xl">
            {formatStudentName(student.firstName, student.lastName)}
          </h1>
          {metaLine ? (
            <p className="mt-1 text-sm text-[#647A9B]">{metaLine}</p>
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
          {!isArchived ? (
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
          ) : null}

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
        </div>
      </div>
    </div>
  );
}
