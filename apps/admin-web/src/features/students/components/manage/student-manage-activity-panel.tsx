"use client";

import { useMemo } from "react";

import { Card } from "@/src/shared/components/ui/card";

import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { formatStudentName } from "@/src/features/students/utils/student-overview.utils";

interface Props {
  student: Student;
}

function ActivityItem({
  title,
  description,
  date,
}: {
  title: string;
  description: string;
  date: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-3">
      <p className="text-sm font-medium text-[#102A56]">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <p className="mt-2 text-xs text-slate-500">{date}</p>
    </div>
  );
}

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
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[#102A56]">Activity</h2>
        <p className="text-sm text-[#647A9B]">
          Recent activity for {student.studentCode}
        </p>
      </div>

      <Card className="rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="space-y-3">
          {items.map((item) => (
            <ActivityItem
              key={item.key}
              title={item.title}
              description={item.description}
              date={item.date}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
