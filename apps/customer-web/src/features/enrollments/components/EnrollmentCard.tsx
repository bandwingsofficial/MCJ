"use client";

import Link from "next/link";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";
import { PaymentButton } from "@/src/features/payments/components/PaymentButton";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

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

function getEnrollmentStatusLabel(enrollment: Enrollment): string {
  if (enrollment.status === "ADMITTED" || enrollment.status === "ACTIVE") {
    return "Admitted";
  }

  if (enrollment.status === "PENDING_APPROVAL") {
    return "Awaiting Approval";
  }

  if (enrollment.status === "PENDING" && enrollment.paymentStatus === "PAID") {
    return "Awaiting Approval";
  }

  return enrollment.status.replaceAll("_", " ");
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const trainer = enrollment.batch.trainers[0];
  const canPay =
    enrollment.status === "PENDING" && enrollment.paymentStatus === "UNPAID";

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
            { label: "Batch", value: enrollment.batch.name },
            {
              label: "Trainer",
              value: trainer
                ? `${trainer.firstName} ${trainer.lastName}`
                : "—",
            },
            { label: "Branch", value: enrollment.branch.branchName },
            {
              label: "Enrollment Date",
              value: new Date(enrollment.createdAt).toLocaleDateString(),
            },
            {
              label: "Amount",
              value: `₹${enrollment.finalAmount}`,
              className: "font-bold text-slate-900",
            },
            {
              label: "Admission",
              value:
                enrollment.status === "ADMITTED" ||
                enrollment.status === "ACTIVE"
                  ? "Admitted"
                  : enrollment.status === "REJECTED"
                    ? "Rejected"
                    : "Pending",
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="mb-1 text-xs font-medium text-slate-500">
                {item.label}
              </p>
              <p
                className={`text-sm text-slate-900 ${item.className || "font-medium"}`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

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

        {enrollment.remarks ? (
          <>
            <div className="my-6">
              <Separator />
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Remarks
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                {enrollment.remarks}
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
        ) : enrollment.status === "ADMITTED" || enrollment.status === "ACTIVE" ? (
          <Link href={`/student/courses/${enrollment.course.id}`}>
            <Button className="font-semibold">Go to Course</Button>
          </Link>
        ) : (
          <Button disabled variant="outline" className="font-semibold">
            {enrollment.status === "REJECTED"
              ? "Enrollment Rejected"
              : "Awaiting Approval"}
          </Button>
        )}
      </div>
    </Card>
  );
}
