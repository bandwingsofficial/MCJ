"use client";

import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { EnrollmentActions } from "@/src/features/enrollments/components/table/enrollment-actions";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import type { Enrollment } from "@/src/features/enrollments/types";

interface EnrollmentTableProps {
  enrollments: Enrollment[];
  emptyTitle?: string;
  emptyDescription?: string;
  actionsDisabled?: boolean;
  onEdit: (enrollment: Enrollment) => void;
  onManage: (enrollment: Enrollment) => void;
  onUnenroll?: (enrollment: Enrollment) => void;
}

export function EnrollmentTable({
  enrollments,
  emptyTitle = "No Enrolments Yet",
  emptyDescription = "Create your first enrolment to get started.",
  actionsDisabled = false,
  onEdit,
  onManage,
  onUnenroll,
}: EnrollmentTableProps) {
  const columnCount = 7;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Student Code
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Student
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Branch
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Batch
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Course
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
          {enrollments.length === 0 ? (
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
            enrollments.map((enrollment) => {
              const studentName =
                formatPersonName(
                  enrollment.student?.firstName,
                  enrollment.student?.lastName,
                ) || "—";

              return (
                <tr
                  key={enrollment.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    enrollment.isDeleted ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  <td className="!px-4 !py-4 align-middle font-mono text-sm text-slate-700">
                    {enrollment.student?.studentCode ?? "—"}
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <button
                      type="button"
                      className="text-left text-sm font-medium leading-snug text-[#2563EB] hover:underline"
                      onClick={() => onManage(enrollment)}
                    >
                      {studentName}
                    </button>
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {enrollment.branch?.branchName ?? "—"}
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {enrollment.batch?.name ?? "—"}
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {enrollment.course?.title ?? "—"}
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <EnrollmentStatusBadge
                      status={enrollment.status}
                      isDeleted={enrollment.isDeleted}
                    />
                  </td>
                  <td className="!px-8 !py-4 text-right align-middle">
                    <EnrollmentActions
                      enrollment={enrollment}
                      disabled={actionsDisabled}
                      onEdit={onEdit}
                      onManage={onManage}
                      onUnenroll={onUnenroll}
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
