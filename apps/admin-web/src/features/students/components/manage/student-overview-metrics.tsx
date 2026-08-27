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
      bgClass: "bg-orange-50",
    },
    {
      key: "total-enrollments",
      label: "Total Enrollments",
      hint: "Total enrollments",
      value: stats.totalEnrollments,
      icon: GraduationCap,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    {
      key: "active-courses",
      label: "Active Courses",
      hint: "Enrolled courses",
      value: stats.activeCourseCount,
      icon: BookOpen,
      iconClass: "text-[#2563EB]",
      bgClass: "bg-blue-50",
    },
    {
      key: "attendance",
      label: "Attendance",
      hint: "Average attendance",
      value: attendanceLabel,
      icon: ClipboardCheck,
      iconClass: "text-sky-600",
      bgClass: "bg-sky-50",
      isText: true,
    },
    {
      key: "total-paid",
      label: "Total Paid",
      hint: "Total payments",
      value: formatCurrency(stats.totalPaid),
      icon: CreditCard,
      iconClass: "text-rose-600",
      bgClass: "bg-rose-50",
      isText: true,
    },
    {
      key: "pending-due",
      label: "Pending Due",
      hint: "Pending amount",
      value: formatCurrency(stats.pendingDue),
      icon: CalendarDays,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50",
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
      bgClass: "bg-emerald-50",
    },
    {
      key: "summary-courses",
      label: "Courses",
      hint: "Enrolled courses",
      value: stats.activeCourseCount,
      icon: BookOpen,
      iconClass: "text-[#2563EB]",
      bgClass: "bg-blue-50",
    },
    {
      key: "summary-batches",
      label: "Batches",
      hint: "Enrolled batches",
      value: stats.activeBatchCount,
      icon: Layers,
      iconClass: "text-orange-600",
      bgClass: "bg-orange-50",
    },
    {
      key: "summary-attendance",
      label: "Attendance",
      hint: "Average attendance",
      value: attendanceLabel,
      icon: ClipboardCheck,
      iconClass: "text-sky-600",
      bgClass: "bg-sky-50",
      isText: true,
    },
    {
      key: "summary-total-paid",
      label: "Total Paid",
      hint: "Total payments",
      value: formatCurrency(stats.totalPaid),
      icon: CreditCard,
      iconClass: "text-rose-600",
      bgClass: "bg-rose-50",
      isText: true,
    },
    {
      key: "summary-pending-due",
      label: "Pending Due",
      hint: "Pending amount",
      value: formatCurrency(stats.pendingDue),
      icon: CalendarDays,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50",
      isText: true,
    },
  ];

  return <StudentOverviewMetricGrid metrics={metrics} isLoading={isLoading} />;
}
