"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";

import { BRANCH_TABLE_CARD_CLASS } from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import {
  BranchManageTableShell,
  TABLE_CELL_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { Card } from "@/src/shared/components/ui/card";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { formatStudentName } from "@/src/features/students/utils/student-overview.utils";

interface Props {
  student: Student;
}

const ACTIVITY_COLUMNS = [
  { key: "event", label: "Event" },
  { key: "description", label: "Description" },
  { key: "date", label: "Date", className: "w-40" },
];

export function StudentManageActivityPanel({ student }: Props) {
  const studentName = formatStudentName(student.firstName, student.lastName);

  const items = useMemo(
    () =>
      [
        {
          key: "created",
          title: "Student created",
          description: `${studentName} (${student.studentCode}) was added to the system.`,
          date: formatStudentDate(student.createdAt),
        },
        {
          key: "updated",
          title: "Profile updated",
          description: "Student profile information was last updated.",
          date: formatStudentDate(student.updatedAt),
        },
        student.deletedAt
          ? {
              key: "archived",
              title: "Student archived",
              description: "This student was archived and can be restored.",
              date: formatStudentDate(student.deletedAt),
            }
          : null,
      ].filter(Boolean) as Array<{
        key: string;
        title: string;
        description: string;
        date: string;
      }>,
    [student, studentName],
  );

  return (
    <div className="space-y-3">
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
          Activity
        </h2>
        <p className="text-xs text-[#647A9B] sm:text-[13px]">
          Recent activity for {student.studentCode}
        </p>
      </div>

      <Card className={BRANCH_TABLE_CARD_CLASS}>
        <BranchManageTableShell
          columns={ACTIVITY_COLUMNS}
          isEmpty={items.length === 0}
          emptyTitle="No activity recorded"
          emptyDescription="Activity events for this student will appear here."
          emptyIcon={Activity}
          embedded
        >
          {items.map((item) => (
            <tr
              key={item.key}
              className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
            >
              <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                {item.title}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {item.description}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {item.date}
              </td>
            </tr>
          ))}
        </BranchManageTableShell>
      </Card>
    </div>
  );
}
