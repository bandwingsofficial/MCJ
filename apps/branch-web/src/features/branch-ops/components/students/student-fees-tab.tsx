"use client";

import { useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { StudentFeePayment } from "@/src/features/branch-ops/types";
import {
  formatBatchDate,
  formatBatchLabel,
  formatBatchStatus,
} from "@/src/features/branch-ops/utils/batch-display";
import { formatCurrency } from "@/src/features/branch-ops/utils/format-currency";
import {
  DEFAULT_PAGE_SIZE,
  paginationParams,
} from "@/src/features/branch-ops/utils/pagination.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { AppSelect } from "@/src/shared/components/ui/select";
import { TablePaginationBar } from "@/src/shared/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

function paymentStatusVariant(status: string) {
  if (status === "PAID" || status === "SUCCESS") return "success" as const;
  if (status === "PARTIAL" || status === "PENDING") return "warning" as const;
  if (status === "FAILED") return "danger" as const;
  return "default" as const;
}

interface Props {
  studentId: string;
}

export function StudentFeesTab({ studentId }: Props) {
  const [enrollmentOverride, setEnrollmentOverride] = useState<
    string | undefined
  >();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const query = useAsyncData(
    () =>
      branchOpsApi.studentFees(studentId, {
        ...(enrollmentOverride ? { enrollmentId: enrollmentOverride } : {}),
        ...paginationParams(page, pageSize),
      }),
    [studentId, enrollmentOverride, page, pageSize],
  );

  if (query.loading && !query.data) {
    return (
      <div className="space-y-3 py-8">
        <Loader />
        <p className="text-center text-sm text-[#647A9B]">
          Loading fee records…
        </p>
      </div>
    );
  }

  if (query.error) {
    return (
      <ErrorState
        description={query.error ?? "Unable to load fee records. Please try again."}
        onRetry={query.reload}
      />
    );
  }

  const data = query.data;
  if (!data) {
    return (
      <ErrorState
        description="Unable to load fee records. Please try again."
        onRetry={query.reload}
      />
    );
  }

  const enrollments = data.enrollments;
  const summary = data.summary;
  const payments = data.payments.items;
  const paymentsTotal = data.payments.total;

  if (!enrollments.length) {
    return (
      <EmptyState title="No fee records available for this enrollment." />
    );
  }

  const enrollmentOptions = enrollments.map((item) => ({
    label: `${item.enrollmentNumber} · ${formatBatchLabel(item.batch.name, item.batch.code)}`,
    value: item.id,
  }));

  const selectedEnrollmentId =
    enrollmentOverride ??
    data.selectedEnrollmentId ??
    enrollments[0]?.id;

  return (
    <div className="space-y-4">
      {enrollments.length > 1 ? (
        <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
            Enrollment
          </p>
          <AppSelect
            value={selectedEnrollmentId}
            options={enrollmentOptions}
            onValueChange={(value) => {
              setEnrollmentOverride(value);
              setPage(1);
            }}
          />
        </Card>
      ) : null}

      {summary ? (
        <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#102A56]">
                Fee Summary
              </p>
              <p className="mt-0.5 text-xs text-[#647A9B]">
                {summary.enrollmentNumber} · {summary.course.title} ·{" "}
                {formatBatchLabel(summary.batch.name, summary.batch.code)}
              </p>
            </div>
            <Badge variant={paymentStatusVariant(summary.paymentStatus)}>
              {formatBatchStatus(summary.paymentStatus)}
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FeeMetric
              label="Total Course Fee"
              value={formatCurrency(summary.totalCourseFee)}
            />
            <FeeMetric
              label="Amount Paid"
              value={formatCurrency(summary.amountPaid)}
            />
            <FeeMetric
              label="Balance Due"
              value={formatCurrency(summary.balanceDue)}
            />
            <FeeMetric
              label="Payment Status"
              value={formatBatchStatus(summary.paymentStatus)}
            />
          </div>
        </Card>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white">
        <div className="border-b border-[#E1EBF5] px-4 py-3">
          <p className="text-sm font-semibold text-[#102A56]">
            Payment History
          </p>
        </div>

        {query.loading && query.data ? (
          <div className="p-6">
            <Loader />
          </div>
        ) : !payments.length ? (
          <EmptyState title="No payment records for this enrollment." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: StudentFeePayment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-[#102A56]">
                      {payment.paymentNumber}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatBatchDate(payment.paidAt ?? payment.createdAt)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      {formatBatchStatus(payment.paymentMethod)}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {payment.transactionId ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusVariant(payment.paymentStatus)}>
                        {formatBatchStatus(payment.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-[#647A9B]">
                      {payment.remarks ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePaginationBar
              page={page}
              pageSize={pageSize}
              total={paymentsTotal}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function FeeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-[#102A56]">{value}</p>
    </div>
  );
}
