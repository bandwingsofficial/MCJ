"use client";

import { Eye, Trash2 } from "lucide-react";

import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import {
  formatBatchLabel,
  formatPersonName,
} from "@/src/features/branches/utils/branch-display.utils";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import {
  formatCurrency,
  normalizeMoney,
} from "@/src/features/enrollments/utils/format-payment";
import { StudentEnrollmentActiveBadge } from "@/src/features/students/components/manage/student-enrollment-active-badge";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  enrollment: Enrollment;
  onManage?: (studentId: string) => void;
  onRemove?: (enrollment: Enrollment) => void;
  removeDisabled?: boolean;
}

function formatEnrollmentFinalAmount(enrollment: Enrollment): number {
  const fee = normalizeMoney(enrollment.feeAmount);
  const discount = normalizeMoney(enrollment.discountAmount);
  const finalAmount = normalizeMoney(enrollment.finalAmount);

  if (finalAmount > 0) {
    return finalAmount;
  }

  return Math.max(0, fee - discount);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="truncate text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export function BranchStudentEnrolledCard({
  enrollment,
  onManage,
  onRemove,
  removeDisabled = false,
}: Props) {
  const student = enrollment.student;
  const studentName = formatPersonName(
    student?.firstName,
    student?.lastName,
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {studentName || "Unknown student"}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-slate-500">
            {student?.studentCode ?? "—"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <StudentEnrollmentActiveBadge enrollment={enrollment} />
          {onRemove ? (
            <BranchIconAction
              icon={Trash2}
              label="Remove enrollment"
              destructive
              disabled={removeDisabled}
              onClick={() => onRemove(enrollment)}
            />
          ) : null}
          {student?.id && onManage ? (
            <BranchIconAction
              icon={Eye}
              label="Manage student"
              onClick={() => onManage(student.id)}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <DetailRow label="Email" value={student?.email ?? "—"} />
        <DetailRow label="Phone" value={student?.phone ?? "—"} />
        <DetailRow
          label="Batch"
          value={
            enrollment.batch?.name
              ? formatBatchLabel(
                  enrollment.batch.name,
                  enrollment.batch.code,
                )
              : "—"
          }
        />
        <DetailRow
          label="Course"
          value={enrollment.course?.title ?? "—"}
        />
        <DetailRow
          label="Enrollment Date"
          value={formatStudentDate(
            enrollment.admissionDate ?? enrollment.createdAt,
          )}
        />
        <DetailRow
          label="Final Amount"
          value={formatCurrency(formatEnrollmentFinalAmount(enrollment))}
        />
      </div>
    </article>
  );
}
