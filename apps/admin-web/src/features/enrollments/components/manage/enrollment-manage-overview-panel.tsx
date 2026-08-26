"use client";

import { BookOpen, CalendarDays, CreditCard, GraduationCap } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import { formatBatchOverviewTiming } from "@/src/features/batches/utils/batch-progress.utils";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { EnrollmentDetailItem } from "@/src/features/enrollments/components/manage/enrollment-detail-item";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import {
  StudentOverviewMetricGrid,
  type OverviewMetricItem,
} from "@/src/features/students/components/manage/student-overview-metric-grid";
import {
  formatEnrollmentCategoryName,
  formatEnrollmentTrainerNames,
} from "@/src/features/students/utils/enrollment-display.utils";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  enrollment: Enrollment;
}

export function EnrollmentManageOverviewPanel({ enrollment }: Props) {
  const studentName = formatPersonName(
    enrollment.student?.firstName,
    enrollment.student?.lastName,
  );
  const batchTiming =
    enrollment.batch?.startTime && enrollment.batch?.endTime
      ? formatBatchOverviewTiming(
          enrollment.batch.startTime,
          enrollment.batch.endTime,
        )
      : "—";

  const metrics: OverviewMetricItem[] = [
    {
      key: "fee",
      label: "Total Fee",
      hint: "Course fee",
      value: formatCurrency(enrollment.finalAmount || enrollment.feeAmount),
      icon: GraduationCap,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
      isText: true,
    },
    {
      key: "paid",
      label: "Amount Paid",
      hint: "Collected so far",
      value: formatCurrency(enrollment.paidAmount),
      icon: CreditCard,
      iconClass: "text-rose-600",
      bgClass: "bg-rose-50",
      isText: true,
    },
    {
      key: "due",
      label: "Remaining",
      hint: "Balance due",
      value: formatCurrency(enrollment.dueAmount),
      icon: CalendarDays,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50",
      isText: true,
    },
    {
      key: "course",
      label: "Course",
      hint: enrollment.category?.name ?? "Assigned course",
      value: enrollment.course?.title ?? "—",
      icon: BookOpen,
      iconClass: "text-[#2447A8]",
      bgClass: "bg-blue-50",
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      <StudentOverviewMetricGrid metrics={metrics} />

      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Enrollment Information
          </h2>
          <EnrollmentStatusBadge status={enrollment.status} />
          <PaymentStatusBadge status={enrollment.paymentStatus} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <EnrollmentDetailItem
            label="Enrollment No"
            value={enrollment.enrollmentNumber}
          />
          <EnrollmentDetailItem label="Student" value={studentName || "—"} />
          <EnrollmentDetailItem
            label="Student Code"
            value={enrollment.student?.studentCode ?? "—"}
          />
          <EnrollmentDetailItem
            label="Branch"
            value={enrollment.branch?.branchName ?? "—"}
          />
          <EnrollmentDetailItem
            label="Batch"
            value={enrollment.batch?.name ?? "—"}
          />
          <EnrollmentDetailItem
            label="Batch Code"
            value={enrollment.batch?.code ?? "—"}
          />
          <EnrollmentDetailItem
            label="Course"
            value={enrollment.course?.title ?? "—"}
          />
          <EnrollmentDetailItem
            label="Category"
            value={formatEnrollmentCategoryName(enrollment)}
          />
          <EnrollmentDetailItem
            label="Trainer"
            value={formatEnrollmentTrainerNames(enrollment)}
          />
          <EnrollmentDetailItem
            label="Batch Start"
            value={formatStudentDate(enrollment.batch?.startDate)}
          />
          <EnrollmentDetailItem
            label="Batch End"
            value={formatStudentDate(enrollment.batch?.endDate)}
          />
          <EnrollmentDetailItem label="Batch Timing" value={batchTiming} />
          <EnrollmentDetailItem
            label="Source"
            value={enrollment.source === "ADMIN" ? "OFFLINE" : "ONLINE"}
          />
          <EnrollmentDetailItem
            label="Enrollment Date"
            value={formatStudentDate(
              enrollment.admissionDate ?? enrollment.createdAt,
            )}
          />
          <EnrollmentDetailItem
            label="Total Fee"
            value={formatCurrency(enrollment.finalAmount || enrollment.feeAmount)}
          />
          <EnrollmentDetailItem
            label="Amount Paid"
            value={formatCurrency(enrollment.paidAmount)}
          />
          <EnrollmentDetailItem
            label="Remaining Amount"
            value={formatCurrency(enrollment.dueAmount)}
          />
        </div>
      </Card>
    </div>
  );
}
