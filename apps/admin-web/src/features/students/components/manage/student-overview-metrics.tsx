"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Layers,
} from "lucide-react";

import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import type { StudentOverviewStats } from "@/src/features/students/utils/student-overview.utils";

import {
  StudentOverviewMetricGrid,
  type OverviewMetricItem,
} from "./student-overview-metric-grid";

interface Props {
  stats: StudentOverviewStats;
  isLoading?: boolean;
}

export function StudentOverviewPrimaryMetrics({ stats, isLoading }: Props) {
  const attendanceLabel =
    stats.attendancePercent === null
      ? "—"
      : `${stats.attendancePercent}%`;

  const metrics: OverviewMetricItem[] = [
    {
      key: "active-batches",
      label: "Active Batches",
      hint: "Enrolled batches",
      value: stats.activeBatchCount,
      icon: Layers,
      iconClass: "text-orange-600",
      bgClass: "bg-orange-50/90 ring-orange-100/80",
      cardClass:
        "border-orange-200/80 bg-gradient-to-br from-orange-50/60 via-[#FFFBF5] to-[#FFF8ED]",
    },
    {
      key: "total-enrollments",
      label: "Total Enrollments",
      hint: "Total enrollments",
      value: stats.totalEnrollments,
      icon: GraduationCap,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50/90 ring-emerald-100/80",
      cardClass:
        "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
    },
    {
      key: "active-courses",
      label: "Active Courses",
      hint: "Enrolled courses",
      value: stats.activeCourseCount,
      icon: BookOpen,
      iconClass: "text-[#2563EB]",
      bgClass: "bg-blue-50/90 ring-blue-100/80",
      cardClass:
        "border-[#C7D9F5] bg-gradient-to-br from-[#F8FBFF] via-[#F3F8FF] to-[#EAF2FB]",
    },
    {
      key: "attendance",
      label: "Attendance",
      hint: "Average attendance",
      value: attendanceLabel,
      icon: ClipboardCheck,
      iconClass: "text-sky-600",
      bgClass: "bg-sky-50/90 ring-sky-100/80",
      cardClass:
        "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
      isText: true,
    },
    {
      key: "total-paid",
      label: "Total Paid",
      hint: "Total payments",
      value: formatCurrency(stats.totalPaid),
      icon: CreditCard,
      iconClass: "text-rose-600",
      bgClass: "bg-rose-50/90 ring-rose-100/80",
      cardClass:
        "border-rose-200/70 bg-gradient-to-br from-rose-50/50 via-[#FFF7F8] to-[#FFF1F3]",
      isText: true,
    },
    {
      key: "pending-due",
      label: "Pending Due",
      hint: "Pending amount",
      value: formatCurrency(stats.pendingDue),
      icon: CalendarDays,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50/90 ring-amber-100/80",
      cardClass:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
      isText: true,
    },
  ];

  return <StudentOverviewMetricGrid metrics={metrics} isLoading={isLoading} />;
}

export function StudentOverviewSummaryMetrics({ stats, isLoading }: Props) {
  const attendanceLabel =
    stats.attendancePercent === null
      ? "—"
      : `${stats.attendancePercent}%`;

  const metrics: OverviewMetricItem[] = [
    {
      key: "summary-enrollments",
      label: "Enrollments",
      hint: "Total enrollments",
      value: stats.totalEnrollments,
      icon: GraduationCap,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50/90 ring-emerald-100/80",
      cardClass:
        "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
    },
    {
      key: "summary-courses",
      label: "Courses",
      hint: "Enrolled courses",
      value: stats.activeCourseCount,
      icon: BookOpen,
      iconClass: "text-[#2563EB]",
      bgClass: "bg-blue-50/90 ring-blue-100/80",
      cardClass:
        "border-[#C7D9F5] bg-gradient-to-br from-[#F8FBFF] via-[#F3F8FF] to-[#EAF2FB]",
    },
    {
      key: "summary-batches",
      label: "Batches",
      hint: "Enrolled batches",
      value: stats.activeBatchCount,
      icon: Layers,
      iconClass: "text-orange-600",
      bgClass: "bg-orange-50/90 ring-orange-100/80",
      cardClass:
        "border-orange-200/80 bg-gradient-to-br from-orange-50/60 via-[#FFFBF5] to-[#FFF8ED]",
    },
    {
      key: "summary-attendance",
      label: "Attendance",
      hint: "Average attendance",
      value: attendanceLabel,
      icon: ClipboardCheck,
      iconClass: "text-sky-600",
      bgClass: "bg-sky-50/90 ring-sky-100/80",
      cardClass:
        "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
      isText: true,
    },
    {
      key: "summary-total-paid",
      label: "Total Paid",
      hint: "Total payments",
      value: formatCurrency(stats.totalPaid),
      icon: CreditCard,
      iconClass: "text-rose-600",
      bgClass: "bg-rose-50/90 ring-rose-100/80",
      cardClass:
        "border-rose-200/70 bg-gradient-to-br from-rose-50/50 via-[#FFF7F8] to-[#FFF1F3]",
      isText: true,
    },
    {
      key: "summary-pending-due",
      label: "Pending Due",
      hint: "Pending amount",
      value: formatCurrency(stats.pendingDue),
      icon: CalendarDays,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50/90 ring-amber-100/80",
      cardClass:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
      isText: true,
    },
  ];

  return <StudentOverviewMetricGrid metrics={metrics} isLoading={isLoading} />;
}
