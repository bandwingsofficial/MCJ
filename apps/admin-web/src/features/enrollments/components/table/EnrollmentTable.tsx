"use client";

import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { EnrollmentActions } from "@/src/features/enrollments/components/table/enrollment-actions";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import type { Enrollment } from "@/src/features/enrollments/types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface EnrollmentTableProps {
  enrollments: Enrollment[];
  emptyMessage?: string;
  actionsDisabled?: boolean;
  onEdit: (enrollment: Enrollment) => void;
  onManage: (enrollment: Enrollment) => void;
}

export function EnrollmentTable({
  enrollments,
  emptyMessage = "No data yet",
  actionsDisabled = false,
  onEdit,
  onManage,
}: EnrollmentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-[#F6F9FD]">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Enrollment No
            </th>
            <th className="min-w-[160px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student
            </th>
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Branch
            </th>
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Batch
            </th>
            <th className="min-w-[160px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Course
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Enrollment Date
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="w-[6.5rem] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {enrollments.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-3 py-12 text-center align-middle"
              >
                <p className="text-sm font-medium text-[#102A56]">
                  {emptyMessage}
                </p>
              </td>
            </tr>
          ) : (
            enrollments.map((enrollment) => {
              const studentName =
                formatPersonName(
                  enrollment.student?.firstName,
                  enrollment.student?.lastName,
                ) || "—";

              return (
                <tr
                  key={enrollment.id}
                  className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                >
                  <td className="px-3 py-3 align-middle font-mono text-[15px] font-medium text-[#102A56]">
                    {enrollment.enrollmentNumber}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <button
                      type="button"
                      className="text-left text-[15px] font-medium text-[#2563EB] hover:underline"
                      onClick={() => onManage(enrollment)}
                    >
                      {studentName}
                    </button>
                  </td>
                  <td className="px-3 py-3 align-middle text-slate-700">
                    {enrollment.branch?.branchName ?? "—"}
                  </td>
                  <td className="px-3 py-3 align-middle text-slate-700">
                    {enrollment.batch?.name ?? "—"}
                  </td>
                  <td className="px-3 py-3 align-middle text-slate-700">
                    {enrollment.course?.title ?? "—"}
                  </td>
                  <td className="px-3 py-3 align-middle text-slate-700">
                    {formatStudentDate(
                      enrollment.admissionDate ?? enrollment.createdAt,
                    )}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <EnrollmentStatusBadge status={enrollment.status} />
                  </td>
                  <td className="px-2 py-3 align-middle">
                    <EnrollmentActions
                      enrollment={enrollment}
                      disabled={actionsDisabled}
                      onEdit={onEdit}
                      onManage={onManage}
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
