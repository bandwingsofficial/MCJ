"use client";

import type { FacultyStudentAttentionItem } from "../types/facultyDashboard.types";
import { DASHBOARD_LIST_LIMIT, DASHBOARD_ROUTES } from "../constants";
import { StudentAttentionRow } from "./StudentAttentionRow";
import {
  DASHBOARD_TABLE,
  DASHBOARD_TABLE_HEAD,
} from "./DashboardTable";
import {
  DashboardEmptyState,
  DashboardSection,
} from "./DashboardSection";

interface Props {
  students: FacultyStudentAttentionItem[];
}

export function StudentsAttention({ students }: Props) {
  const rows = students.slice(0, DASHBOARD_LIST_LIMIT);

  return (
    <DashboardSection
      title="Students Requiring Attention"
      viewAllHref={DASHBOARD_ROUTES.enrollments}
    >
      {!rows.length ? (
        <DashboardEmptyState message="All students are on track." />
      ) : (
        <table className={DASHBOARD_TABLE}>
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[22%]" />
            <col className="w-[28%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className={DASHBOARD_TABLE_HEAD}>
              <th className="pb-2 pr-2 font-semibold">Student</th>
              <th className="pb-2 pr-2 font-semibold">Batch</th>
              <th className="pb-2 pr-2 font-semibold">Issue</th>
              <th className="pb-2 pr-2 font-semibold">Metric</th>
              <th className="pb-2 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student) => (
              <StudentAttentionRow
                key={`${student.studentId}-${student.batchId}`}
                student={student}
              />
            ))}
          </tbody>
        </table>
      )}
    </DashboardSection>
  );
}
