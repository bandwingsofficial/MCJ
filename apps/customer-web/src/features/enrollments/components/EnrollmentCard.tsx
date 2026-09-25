"use client";

import Link from "next/link";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";
import { PaymentButton } from "@/src/features/payments/components/PaymentButton";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatEnrollmentTime } from "@/src/features/enrollments/utils/enrollment-batch.utils";
import {
  canPayEnrollmentAdvance,
  getEnrollmentPaymentStatusLabel,
  getEnrollmentStatusLabel,
  isAdvancedEnrollment,
} from "@/src/features/enrollments/utils/enrollment-status.utils";

interface EnrollmentCardProps {
  enrollment: Enrollment;
}

function getStatusVariant(
  status: Enrollment["status"],
): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "ADMITTED":
    case "ACTIVE":
      return "success";
    case "PENDING":
    case "PENDING_APPROVAL":
    case "ADVANCED":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
      return "danger";
    case "COMPLETED":
      return "info";
    default:
      return "default";
  }
}

function getPaymentVariant(
  status: Enrollment["paymentStatus"],
): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "PAID":
      return "success";
    case "PARTIAL":
      return "warning";
    case "UNPAID":
      return "danger";
    case "REFUNDED":
      return "info";
    default:
      return "default";
  }
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const canPay = canPayEnrollmentAdvance(enrollment);
  const coinDiscount = enrollment.coinDiscountAmount ?? 0;
  const primaryPayment = enrollment.payments?.[0];

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              {enrollment.course.title}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {enrollment.category.name}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant={getStatusVariant(enrollment.status)}>
                {getEnrollmentStatusLabel(enrollment)}
              </Badge>
              <Badge variant={getPaymentVariant(enrollment.paymentStatus)}>
                {enrollment.paymentStatus}
              </Badge>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Enrollment ID
            </p>
            <p className="font-mono text-sm font-semibold text-slate-700">
              {enrollment.enrollmentNumber}
            </p>
          </div>
        </div>

        <div className="my-6">
          <Separator />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Course", value: enrollment.course.title },
            { label: "Branch", value: enrollment.branch.branchName },
            { label: "Batch", value: enrollment.batch.name },
            (() => {
              const timing = enrollment.batchTiming;
              const name = timing?.name?.trim() || "—";
              const start = timing?.startTime
                ? formatEnrollmentTime(timing.startTime)
                : null;
              const end = timing?.endTime
                ? formatEnrollmentTime(timing.endTime)
                : null;
              const timeLine =
                start &&
                end &&
                !(timing?.startTime === "00:00" && timing?.endTime === "23:59")
                  ? `${start} – ${end}`
                  : null;

              return {
                label: "Batch Timing",
                value: name,
                secondaryValue: timeLine,
              };
            })(),
            {
              label: "Mode",
              value:
                enrollment.mode === "SELF_PACED"
                  ? "Self-Paced"
                  : enrollment.mode === "ONLINE"
                    ? "Online"
                    : enrollment.mode === "OFFLINE"
                      ? "Offline"
                      : "—",
            },
            {
              label: "Application Type",
              value:
                enrollment.applicationType === "ONLINE" ? "Online" : "Offline",
            },
            {
              label: "Enrollment Date",
              value: new Date(enrollment.createdAt).toLocaleDateString(),
            },
            {
              label: "Status",
              value: getEnrollmentStatusLabel(enrollment),
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="mb-1 text-xs font-medium text-slate-500">
                {item.label}
              </p>
              <p className="text-sm font-medium text-slate-900">{item.value}</p>
              {"secondaryValue" in item && item.secondaryValue ? (
                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {item.secondaryValue}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {enrollment.finalAmount > 0 ||
        (enrollment.payments && enrollment.payments.length > 0) ? (
          <>
            <div className="my-6">
              <Separator />
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Summary
              </p>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    label: "Payment Status",
                    value: getEnrollmentPaymentStatusLabel(enrollment),
                  },
                  {
                    label: "Grand Total",
                    value: `₹${Number(enrollment.finalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                  },
                  ...(coinDiscount > 0
                    ? [
                        {
                          label: "Coin Discount",
                          value: `-₹${Number(coinDiscount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                        },
                      ]
                    : []),
                  ...(isAdvancedEnrollment(enrollment)
                    ? [
                        {
                          label: "Advance Paid",
                          value: `₹${Number(enrollment.paidAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                        },
                        {
                          label: "Amount Due",
                          value: `₹${Number(enrollment.dueAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                        },
                      ]
                    : []),
                  {
                    label: "Payment Method",
                    value: primaryPayment?.paymentMethod ?? "—",
                  },
                  {
                    label: "Payment ID",
                    value: primaryPayment?.gatewayPaymentId ?? "—",
                  },
                  {
                    label: "Order ID",
                    value: primaryPayment?.gatewayOrderId ?? "—",
                  },
                  {
                    label: "Payment Date",
                    value: primaryPayment?.paidAt
                      ? new Date(primaryPayment.paidAt).toLocaleDateString()
                      : "—",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {enrollment.rejectionReason ? (
          <>
            <div className="my-6">
              <Separator />
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-red-700">
                Rejection Reason
              </p>
              <p className="text-sm text-red-800">
                {enrollment.rejectionReason}
              </p>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex flex-col justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row">
        <Link href={`/student/enrollments/${enrollment.id}`}>
          <Button variant="outline" className="font-semibold">
            View Details
          </Button>
        </Link>
        {canPay ? (
          <PaymentButton enrollmentId={enrollment.id} />
        ) : enrollment.status === "ADMITTED" ||
          enrollment.status === "ACTIVE" ? (
          <Link href={`/student/my-learning`}>
            <Button className="font-semibold">Go to My Course</Button>
          </Link>
        ) : (
          <Button disabled variant="outline" className="font-semibold">
            {enrollment.status === "REJECTED"
              ? "Enrollment Rejected"
              : "Pending Payment"}
          </Button>
        )}
      </div>
    </Card>
  );
}
