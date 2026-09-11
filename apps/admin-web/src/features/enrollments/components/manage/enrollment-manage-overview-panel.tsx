"use client";

import { BookOpen, CalendarDays, CreditCard, GraduationCap } from "lucide-react";

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
      bgClass: "bg-emerald-50/90 ring-emerald-100/80",
      cardClass:
        "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
      isText: true,
    },
    {
      key: "paid",
      label: "Amount Paid",
      hint: "Collected so far",
      value: formatCurrency(enrollment.paidAmount),
      icon: CreditCard,
      iconClass: "text-rose-600",
      bgClass: "bg-rose-50/90 ring-rose-100/80",
      cardClass:
        "border-rose-200/70 bg-gradient-to-br from-rose-50/50 via-[#FFF7F8] to-[#FFF1F3]",
      isText: true,
    },
    {
      key: "due",
      label: "Remaining Amount",
      hint: "Balance due",
      value: formatCurrency(enrollment.dueAmount),
      icon: CalendarDays,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50/90 ring-amber-100/80",
      cardClass:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
      isText: true,
    },
    {
      key: "course",
      label: "Course",
      hint: formatEnrollmentOverviewCategoryName(enrollment),
      value: formatEnrollmentOverviewCourseTitle(enrollment),
      icon: BookOpen,
      iconClass: "text-[#2563EB]",
      bgClass: "bg-blue-50/90 ring-blue-100/80",
      cardClass:
        "border-[#C7D9F5] bg-gradient-to-br from-[#F8FBFF] via-[#F3F8FF] to-[#EAF2FB]",
      isText: true,
    },
  ];

  return (
    <div className="space-y-4">
      <StudentOverviewMetricGrid
        metrics={metrics}
        layout="grid-four"
      />

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#102A56]">
              Enrollment Information
            </h2>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Core enrollment, batch and payment details.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <EnrollmentStatusBadge status={enrollment.status} />
            <PaymentStatusBadge status={enrollment.paymentStatus} />
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </div>
    </div>
  );
}
