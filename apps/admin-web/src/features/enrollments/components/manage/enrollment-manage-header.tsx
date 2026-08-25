"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";

interface Props {
  enrollment: Enrollment;
  activeSection?: string;
}

export function EnrollmentManageHeader({ enrollment, activeSection }: Props) {
  const studentName = formatPersonName(
    enrollment.student?.firstName,
    enrollment.student?.lastName,
  );

  return (
    <div className="space-y-3">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm"
      >
        <Link
          href="/enrollments"
          className="text-slate-500 transition-colors hover:text-blue-600"
        >
          Enrollments
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-700">
          {enrollment.enrollmentNumber}
        </span>
        <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <span className="text-slate-900">Management</span>
        {activeSection ? (
          <>
            <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
            {studentName || "Enrollment"}
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {[
              enrollment.enrollmentNumber,
              enrollment.branch?.branchName,
              enrollment.batch?.name,
              enrollment.course?.title,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <EnrollmentStatusBadge status={enrollment.status} />
            <PaymentStatusBadge status={enrollment.paymentStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
