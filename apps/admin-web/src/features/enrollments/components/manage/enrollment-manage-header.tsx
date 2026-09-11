"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { isCurrentEnrollmentStatus } from "@/src/features/enrollments/utils/current-enrollment";
import { formatEnrollmentOverviewContextLabel } from "@/src/features/enrollments/utils/enrollment-overview.utils";

interface Props {
  enrollment: Enrollment;
  activeSection?: string;
}

export function EnrollmentManageHeader({ enrollment, activeSection }: Props) {
  const studentName = formatPersonName(
    enrollment.student?.firstName,
    enrollment.student?.lastName,
  );
  const isHistorical =
    enrollment.isDeleted || !isCurrentEnrollmentStatus(enrollment.status);

  return (
    <div className="space-y-3">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-xs"
      >
        <Link
          href="/enrollments"
          className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          Enrollments
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-700">
          {enrollment.enrollmentNumber}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-[#102A56]">Management</span>
        {activeSection ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <h1 className="min-w-0 text-xl font-bold tracking-tight text-[#102A56] sm:text-2xl">
                {studentName || "Enrollment"}
              </h1>
              <EnrollmentStatusBadge status={enrollment.status} />
              <PaymentStatusBadge status={enrollment.paymentStatus} />
            </div>

            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                  Enrollment Number
                </dt>
                <dd className="mt-0.5 font-mono text-sm font-medium text-[#102A56]">
                  {enrollment.enrollmentNumber}
                </dd>
              </div>
              <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                  Branch
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                  {enrollment.branch?.branchName ?? "—"}
                </dd>
              </div>
              <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                  Batch
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                  {enrollment.batch?.name ?? "—"}
                </dd>
              </div>
              <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                  Course
                </dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-[#102A56]">
                  {enrollment.course?.title ?? "—"}
                </dd>
              </div>
            </dl>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {formatEnrollmentOverviewContextLabel(enrollment)}
            </p>

            {isHistorical ? (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                This enrollment is historical and read-only. Create a new
                enrollment to place the student in another batch.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
