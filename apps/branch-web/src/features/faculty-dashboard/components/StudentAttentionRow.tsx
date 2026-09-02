"use client";

import Link from "next/link";

import { Badge } from "@/src/shared/components/ui/badge";

import type { FacultyStudentAttentionItem } from "../types/facultyDashboard.types";
import { DASHBOARD_ROUTES } from "../constants";
import {
  DASHBOARD_TABLE_CELL,
  DASHBOARD_TABLE_ROW,
  TruncatedCell,
} from "./DashboardTable";

function attentionBadgeVariant(reason: string) {
  const normalized = reason.toLowerCase();
  if (normalized.includes("attendance") && normalized.includes("%")) {
    return "warning" as const;
  }
  if (normalized.includes("absent")) return "danger" as const;
  if (normalized.includes("assessment")) return "info" as const;
  if (normalized.includes("late")) return "warning" as const;
  return "default" as const;
}

function formatMetric(student: FacultyStudentAttentionItem) {
  if (student.attendancePercentage != null) {
    return `${student.attendancePercentage}%`;
  }
  if (student.absentCount > 0) {
    return `${student.absentCount} absent`;
  }
  return "—";
}

interface Props {
  student: FacultyStudentAttentionItem;
}

export function StudentAttentionRow({ student }: Props) {
  return (
    <tr className={DASHBOARD_TABLE_ROW}>
      <td className={DASHBOARD_TABLE_CELL}>
        <TruncatedCell title={student.studentName}>
          <Link
            href={DASHBOARD_ROUTES.student(student.studentId)}
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            {student.studentName}
          </Link>
        </TruncatedCell>
      </td>
      <td className={DASHBOARD_TABLE_CELL}>
        <TruncatedCell
          className="text-sm text-[#647A9B]"
          title={student.batchName}
        >
          {student.batchName}
        </TruncatedCell>
      </td>
      <td className={DASHBOARD_TABLE_CELL}>
        <Badge
          variant={attentionBadgeVariant(student.reason)}
          className="max-w-full truncate text-[10px]"
        >
          {student.reason}
        </Badge>
      </td>
      <td className={`${DASHBOARD_TABLE_CELL} text-sm font-medium tabular-nums text-[#102A56]`}>
        {formatMetric(student)}
      </td>
      <td className={`${DASHBOARD_TABLE_CELL} text-right`}>
        <Link
          href={DASHBOARD_ROUTES.student(student.studentId)}
          className="text-xs font-medium text-[#2563EB] hover:underline"
        >
          View →
        </Link>
      </td>
    </tr>
  );
}
