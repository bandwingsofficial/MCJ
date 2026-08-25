"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { CreateEnrollmentPaymentModal } from "@/src/features/enrollments/components/manage/create-enrollment-payment-modal";
import { EnrollmentDetailItem } from "@/src/features/enrollments/components/manage/enrollment-detail-item";
import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import { paymentService } from "@/src/features/payments/services/payment.service";
import type { PaymentSummary } from "@/src/features/payments/types/payment.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  enrollment: Enrollment;
  onEnrollmentRefresh?: () => Promise<void>;
}

export function EnrollmentManagePaymentsPanel({
  enrollment,
  onEnrollmentRefresh,
}: Props) {
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const remaining = Math.max(0, enrollment.dueAmount ?? 0);

  const load = async () => {
    setIsLoading(true);
    try {
      const response = await paymentService.getPayments({
        enrollmentId: enrollment.id,
        skip: 0,
        take: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setPayments(response.items ?? []);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [enrollment.id]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Payment Summary
            </h2>
            <PaymentStatusBadge status={enrollment.paymentStatus} />
          </div>
          <Button
            type="button"
            disabled={remaining <= 0}
            className="h-10 rounded-lg bg-blue-600 px-4 font-semibold hover:bg-blue-700"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Payment
          </Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
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

      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Payment History
          </h2>
        </div>
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No data yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Payments recorded for this enrollment will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="border-b border-slate-200 bg-slate-50/95">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="bg-white hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-sm text-slate-700">
                      {payment.paymentNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatStudentDate(payment.paidAt ?? payment.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {payment.paymentStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreateEnrollmentPaymentModal
        open={isCreateOpen}
        enrollment={enrollment}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={async () => {
          await load();
          await onEnrollmentRefresh?.();
        }}
      />
    </div>
  );
}
