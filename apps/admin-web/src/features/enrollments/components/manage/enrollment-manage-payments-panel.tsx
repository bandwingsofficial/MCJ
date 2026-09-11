"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BRANCH_PRIMARY_BUTTON_CLASS } from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import { BranchManagePaginationFooter } from "@/src/features/branches/components/manage/branch-manage-pagination-footer";
import {
  BranchManageTableShell,
  TABLE_CELL_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { Badge } from "@/src/shared/components/ui/badge";
import { CreateEnrollmentPaymentModal } from "@/src/features/enrollments/components/manage/create-enrollment-payment-modal";
import { EnrollmentDetailItem } from "@/src/features/enrollments/components/manage/enrollment-detail-item";
import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import { paymentService } from "@/src/features/payments/services/payment.service";
import type { PaymentSummary } from "@/src/features/payments/types/payment.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

const PAYMENT_COLUMNS = [
  { key: "number", label: "Payment No" },
  { key: "date", label: "Date" },
  { key: "method", label: "Method" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
];

const DEFAULT_PAGE_SIZE = 10;

interface Props {
  enrollment: Enrollment;
  onEnrollmentRefresh?: () => Promise<void>;
}

function PaymentRecordStatusBadge({ status }: { status: string }) {
  if (status === "SUCCESS") {
    return <Badge variant="success">Paid</Badge>;
  }

  if (status === "PENDING") {
    return <Badge variant="warning">Pending</Badge>;
  }

  if (status === "FAILED") {
    return <Badge variant="danger">Failed</Badge>;
  }

  if (status === "REFUNDED") {
    return <Badge variant="info">Refunded</Badge>;
  }

  return <Badge>{status}</Badge>;
}

export function EnrollmentManagePaymentsPanel({
  enrollment,
  onEnrollmentRefresh,
}: Props) {
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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

  const total = payments.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(safePage * pageSize, total);

  const paginatedPayments = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return payments.slice(start, start + pageSize);
  }, [payments, safePage, pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
            Payments
          </h2>
          <p className="text-xs text-[#647A9B] sm:text-[13px]">
            Payment summary and history for {enrollment.enrollmentNumber}
          </p>
        </div>
        <Button
          type="button"
          disabled={remaining <= 0}
          className={BRANCH_PRIMARY_BUTTON_CLASS}
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-1.5 h-4 w-4 shrink-0" />
          Create Payment
        </Button>
      </div>

      <Card className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#102A56]">
              Payment Summary
            </h3>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Current fee status for this enrollment.
            </p>
          </div>
          <PaymentStatusBadge status={enrollment.paymentStatus} />
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <Card className="min-w-0 overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
        <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
          <h3 className="text-base font-semibold text-[#102A56]">
            Payment History
          </h3>
          <p className="mt-0.5 text-sm text-[#647A9B]">
            Recorded payments for this enrollment.
          </p>
        </div>

        <BranchManageTableShell
          columns={PAYMENT_COLUMNS}
          isLoading={isLoading}
          isEmpty={!isLoading && total === 0}
          emptyTitle="No payments recorded"
          emptyDescription="Payments recorded for this enrollment will appear here."
          embedded
        >
          {paginatedPayments.map((payment) => (
            <tr
              key={payment.id}
              className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
            >
              <td className={`${TABLE_CELL_CLASS} font-mono text-[#102A56]`}>
                {payment.paymentNumber}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {formatStudentDate(payment.paidAt ?? payment.createdAt)}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {payment.paymentMethod}
              </td>
              <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                {formatCurrency(payment.amount)}
              </td>
              <td className={TABLE_CELL_CLASS}>
                <PaymentRecordStatusBadge status={payment.paymentStatus} />
              </td>
            </tr>
          ))}
        </BranchManageTableShell>

        <BranchManagePaginationFooter
          from={from}
          to={to}
          total={total}
          page={safePage}
          pageSize={pageSize}
          totalPages={totalPages}
          disabled={isLoading}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
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
