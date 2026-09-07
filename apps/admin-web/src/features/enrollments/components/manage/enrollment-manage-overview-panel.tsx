"use client";

import { BookOpen, CalendarDays, CreditCard, GraduationCap } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import { EnrollmentDetailItem } from "@/src/features/enrollments/components/manage/enrollment-detail-item";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import {
  formatEnrollmentOverviewBatchName,
  formatEnrollmentOverviewBatchNumber,
  formatEnrollmentOverviewBranchName,
  formatEnrollmentOverviewCategoryName,
  formatEnrollmentOverviewCourseTitle,
  formatEnrollmentOverviewDuration,
  formatEnrollmentOverviewEndDate,
  formatEnrollmentOverviewEnrollmentDate,
  formatEnrollmentOverviewSelectedBatchTiming,
  formatEnrollmentOverviewSelectedMode,
  formatEnrollmentOverviewStartDate,
  formatEnrollmentOverviewStudentId,
  formatEnrollmentOverviewStudentName,
  formatEnrollmentOverviewTotalFee,
  formatEnrollmentOverviewTrainerNames,
} from "@/src/features/enrollments/utils/enrollment-overview.utils";
import {
  StudentOverviewMetricGrid,
  type OverviewMetricItem,
} from "@/src/features/students/components/manage/student-overview-metric-grid";

interface Props {
  enrollment: Enrollment;
}

export function EnrollmentManageOverviewPanel({ enrollment }: Props) {
  const totalFee = formatEnrollmentOverviewTotalFee(enrollment);

  const metrics: OverviewMetricItem[] = [
    {
      key: "fee",
      label: "Applicable Price",
      hint: "Total enrollment fee",
      value: formatCurrency(totalFee),
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
      label: "Remaining Amount",
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
      hint: formatEnrollmentOverviewCategoryName(enrollment),
      value: formatEnrollmentOverviewCourseTitle(enrollment),
      icon: BookOpen,
      iconClass: "text-[#2563EB]",
      bgClass: "bg-blue-50",
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      <StudentOverviewMetricGrid metrics={metrics} />

      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-[#102A56]">
            Enrollment Information
          </h2>
          <EnrollmentStatusBadge status={enrollment.status} />
          <PaymentStatusBadge status={enrollment.paymentStatus} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <EnrollmentDetailItem
            label="Enrollment Number"
            value={enrollment.enrollmentNumber}
          />
          <EnrollmentDetailItem
            label="Student"
            value={formatEnrollmentOverviewStudentName(enrollment)}
          />
          <EnrollmentDetailItem
            label="Student ID"
            value={formatEnrollmentOverviewStudentId(enrollment)}
          />
          <EnrollmentDetailItem
            label="Branch"
            value={formatEnrollmentOverviewBranchName(enrollment)}
          />
          <EnrollmentDetailItem
            label="Batch Name"
            value={formatEnrollmentOverviewBatchName(enrollment)}
          />
          <EnrollmentDetailItem
            label="Batch Number"
            value={formatEnrollmentOverviewBatchNumber(enrollment)}
          />
          <EnrollmentDetailItem
            label="Course"
            value={formatEnrollmentOverviewCourseTitle(enrollment)}
          />
          <EnrollmentDetailItem
            label="Category"
            value={formatEnrollmentOverviewCategoryName(enrollment)}
          />
          <EnrollmentDetailItem
            label="Trainer"
            value={formatEnrollmentOverviewTrainerNames(enrollment)}
          />
          <EnrollmentDetailItem
            label="Selected Mode"
            value={formatEnrollmentOverviewSelectedMode(enrollment)}
          />
          <EnrollmentDetailItem
            label="Selected Batch Timing"
            value={formatEnrollmentOverviewSelectedBatchTiming(enrollment)}
          />
          <EnrollmentDetailItem
            label="Batch Start Date"
            value={formatEnrollmentOverviewStartDate(enrollment)}
          />
          <EnrollmentDetailItem
            label="Batch End Date"
            value={formatEnrollmentOverviewEndDate(enrollment)}
          />
          <EnrollmentDetailItem
            label="Duration"
            value={formatEnrollmentOverviewDuration(enrollment)}
          />
          <EnrollmentDetailItem
            label="Enrollment Date"
            value={formatEnrollmentOverviewEnrollmentDate(enrollment)}
          />
          <EnrollmentDetailItem
            label="Applicable Price / Total Fee"
            value={formatCurrency(totalFee)}
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
