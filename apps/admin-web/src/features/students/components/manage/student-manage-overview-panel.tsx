"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  FileImage,
  FileText,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { SortOrder } from "@/src/features/enrollments/types/enrollment.enums";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { paymentService } from "@/src/features/payments/services/payment.service";
import type { PaymentSummary } from "@/src/features/payments/types/payment.types";
import { StudentOverviewEnrollmentCard } from "@/src/features/students/components/manage/student-overview-enrollment-card";
import { StudentOverviewInformation } from "@/src/features/students/components/manage/student-overview-information";
import {
  StudentOverviewPrimaryMetrics,
  StudentOverviewSummaryMetrics,
} from "@/src/features/students/components/manage/student-overview-metrics";
import { studentService } from "@/src/features/students/services/student.service";
import type { BranchOption, Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { computeStudentOverviewStats } from "@/src/features/students/utils/student-overview.utils";
import { getVisibleEnrollments } from "@/src/features/students/utils/enrollment-display.utils";

import type { TabKey } from "./student-manage-workspace";

interface Props {
  student: Student;
  refreshKey?: number;
  onNavigateToTab: (tab: TabKey) => void;
  onStudentRefresh?: () => Promise<void>;
}

function PaymentStatusPill({ status }: { status: string }) {
  if (status === "SUCCESS") {
    return <Badge variant="success">Paid</Badge>;
  }

  if (status === "PENDING") {
    return <Badge variant="warning">Pending</Badge>;
  }

  if (status === "FAILED") {
    return <Badge variant="danger">Failed</Badge>;
  }

  return <Badge>{status}</Badge>;
}

export function StudentManageOverviewPanel({
  student,
  refreshKey = 0,
  onNavigateToTab,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<PaymentSummary[]>([]);

  const branchMap = useMemo(
    () =>
      Object.fromEntries(
        branches.map((branch) => [branch.id, branch.branchName]),
      ),
    [branches],
  );

  const stats = useMemo(
    () => computeStudentOverviewStats(enrollments, payments),
    [enrollments, payments],
  );

  const visibleEnrollments = useMemo(
    () => getVisibleEnrollments(enrollments),
    [enrollments],
  );

  const recentPayments = useMemo(() => payments.slice(0, 5), [payments]);

  const loadOverviewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [branchItems, enrollmentResponse, paymentResponse] =
        await Promise.all([
          studentService.getBranches(),
          enrollmentService.getEnrollments({
            studentId: student.id,
            skip: 0,
            take: 200,
            includeDeleted: true,
            sortBy: "createdAt",
            sortOrder: SortOrder.DESC,
          }),
          paymentService.getPayments({
            studentId: student.id,
            skip: 0,
            take: 10,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        ]);

      setBranches(branchItems);
      const parsed = parseEnrollmentListResponse(enrollmentResponse);
      setEnrollments(parsed.items);
      setPayments(paymentResponse.items ?? []);
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    void loadOverviewData();
  }, [loadOverviewData, refreshKey]);

  const profileDocument = student.profileImageUrl
    ? {
        title: "Profile Photo",
        fileName: "profile-photo",
        addedOn: student.updatedAt,
        url: student.profileImageUrl,
      }
    : null;

  return (
    <div className="space-y-6">
      <StudentOverviewInformation student={student} />

      <StudentOverviewPrimaryMetrics stats={stats} isLoading={isLoading} />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Enrollment Information
        </h2>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : visibleEnrollments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                Not Enrolled Yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Enroll this student from Branch Management to see enrollment
                details here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleEnrollments.map((enrollment) => (
                <StudentOverviewEnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  branchMap={branchMap}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Attendance
            </h2>
            <button
              type="button"
              onClick={() => onNavigateToTab("attendance")}
              className="text-sm font-medium text-[#2447A8] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No attendance records yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Attendance tracking will appear here once available.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Payments
            </h2>
            <button
              type="button"
              onClick={() => onNavigateToTab("payments")}
              className="text-sm font-medium text-[#2447A8] hover:underline"
            >
              View all
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No payments yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Payment history for this student will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {formatStudentDate(payment.paidAt ?? payment.createdAt)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Invoice: {payment.paymentNumber}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <PaymentStatusPill status={payment.paymentStatus} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Documents</h2>
          <button
            type="button"
            onClick={() => onNavigateToTab("documents")}
            className="text-sm font-medium text-[#2447A8] hover:underline"
          >
            View all
          </button>
        </div>

        {profileDocument ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <FileImage className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {profileDocument.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {profileDocument.fileName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Added on {formatStudentDate(profileDocument.addedOn)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3 w-full"
                onClick={() => {
                  window.open(profileDocument.url, "_blank", "noopener,noreferrer");
                }}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No documents uploaded
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Student documents will appear here once uploaded.
            </p>
          </div>
        )}
      </section>

      <section className="border-t border-slate-200/80 pt-8">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Summary</h2>
        <StudentOverviewSummaryMetrics stats={stats} isLoading={isLoading} />
      </section>
    </div>
  );
}
