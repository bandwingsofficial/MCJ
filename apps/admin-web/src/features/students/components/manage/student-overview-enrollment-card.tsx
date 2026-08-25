"use client";

import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { StudentEnrollmentActiveBadge } from "@/src/features/students/components/manage/student-enrollment-active-badge";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import {
  formatEnrollmentBalance,
  formatEnrollmentBatchCode,
  formatEnrollmentBatchName,
  formatEnrollmentCategoryName,
  formatEnrollmentFinalPrice,
  formatEnrollmentPaidAmount,
  formatEnrollmentTrainerNames,
  resolveEnrollmentBranchName,
} from "@/src/features/students/utils/enrollment-display.utils";
import { formatBatchOverviewTiming } from "@/src/features/batches/utils/batch-progress.utils";

interface Props {
  enrollment: Enrollment;
  branchMap?: Record<string, string>;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export function StudentOverviewEnrollmentCard({
  enrollment,
  branchMap = {},
}: Props) {
  const branchName = resolveEnrollmentBranchName(enrollment, branchMap);
  const courseTitle = enrollment.course?.title ?? "—";
  const batchTiming =
    enrollment.batch?.startTime && enrollment.batch?.endTime
      ? formatBatchOverviewTiming(
          enrollment.batch.startTime,
          enrollment.batch.endTime,
        )
      : "—";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-slate-900">
          {formatEnrollmentBatchName(enrollment)}
        </p>
        <span className="font-mono text-xs text-slate-500">
          {formatEnrollmentBatchCode(enrollment)}
        </span>
        <StudentEnrollmentActiveBadge enrollment={enrollment} />
        <PaymentStatusBadge status={enrollment.paymentStatus} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Branch" value={branchName} />
        <DetailItem label="Course" value={courseTitle} />
        <DetailItem
          label="Category"
          value={formatEnrollmentCategoryName(enrollment)}
        />
        <DetailItem
          label="Trainer"
          value={formatEnrollmentTrainerNames(enrollment)}
        />
        <DetailItem
          label="Batch Start"
          value={formatStudentDate(enrollment.batch?.startDate)}
        />
        <DetailItem
          label="Batch End"
          value={formatStudentDate(enrollment.batch?.endDate)}
        />
        <DetailItem label="Batch Timing" value={batchTiming} />
        <DetailItem
          label="Enrollment Date"
          value={formatStudentDate(
            enrollment.admissionDate ?? enrollment.createdAt,
          )}
        />
        <DetailItem
          label="Total Fee"
          value={formatEnrollmentFinalPrice(enrollment)}
        />
        <DetailItem
          label="Amount Paid"
          value={formatEnrollmentPaidAmount(enrollment)}
        />
        <DetailItem
          label="Remaining Amount"
          value={formatEnrollmentBalance(enrollment)}
        />
        <DetailItem label="Enrollment Status" value={enrollment.status} />
      </div>
    </div>
  );
}
