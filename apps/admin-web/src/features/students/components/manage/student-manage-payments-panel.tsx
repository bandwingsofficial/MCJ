"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import { paymentService } from "@/src/features/payments/services/payment.service";
import type { PaymentSummary } from "@/src/features/payments/types/payment.types";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  student: Student;
  refreshKey?: number;
}

function PaymentStatusBadge({ status }: { status: string }) {
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

export function StudentManagePaymentsPanel({ student, refreshKey = 0 }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentSummary[]>([]);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await paymentService.getPayments({
        studentId: student.id,
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
  }, [student.id]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments, refreshKey]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[#102A56]">Payments</h2>
        <p className="text-sm text-[#647A9B]">
          Payment history for {student.studentCode}
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : payments.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">No payments yet</p>
            <p className="mt-1 text-sm text-[#647A9B]">
              Payments recorded for this student will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm text-slate-700">
                      {formatStudentDate(payment.paidAt ?? payment.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#102A56]">
                      {payment.paymentNumber}
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      {payment.enrollment?.courseTitle ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#102A56]">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.paymentStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
