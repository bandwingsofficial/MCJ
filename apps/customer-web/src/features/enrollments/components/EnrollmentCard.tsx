"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";
import { PaymentButton } from "@/src/features/payments/components/PaymentButton";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

interface EnrollmentCardProps {
  enrollment: Enrollment;
}

function getStatusVariant(status: Enrollment["status"]): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "ADMITTED": return "success";
    case "PENDING": return "warning";
    case "REJECTED": case "CANCELLED": return "danger";
    case "COMPLETED": return "info";
    default: return "default";
  }
}

function getPaymentVariant(status: Enrollment["paymentStatus"]): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "PAID": return "success";
    case "PARTIAL": return "warning";
    case "UNPAID": return "danger";
    case "REFUNDED": return "info";
    default: return "default";
  }
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const trainer = enrollment.batch.trainers[0];

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{enrollment.course.title}</h2>
            <p className="text-sm font-medium text-slate-500">{enrollment.category.name}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant={getStatusVariant(enrollment.status)}>{enrollment.status}</Badge>
              <Badge variant={getPaymentVariant(enrollment.paymentStatus)}>{enrollment.paymentStatus}</Badge>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrollment No.</p>
            <p className="font-mono text-sm font-semibold text-slate-700">{enrollment.enrollmentNumber}</p>
          </div>
        </div>

        {/* Separator wrapper to fix className error */}
        <div className="my-6">
          <Separator />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Batch", value: enrollment.batch.name },
            { label: "Trainer", value: trainer ? `${trainer.firstName} ${trainer.lastName}` : "--" },
            { label: "Branch", value: enrollment.branch.branchName },
            { label: "Joining Date", value: new Date(enrollment.joiningDate).toLocaleDateString() },
            { label: "Expected Completion", value: new Date(enrollment.expectedCompletionDate).toLocaleDateString() },
            { label: "Amount", value: `₹${enrollment.finalAmount}`, className: "font-bold text-slate-900" },
          ].map((item, idx) => (
            <div key={idx}>
              <p className="text-xs font-medium text-slate-500 mb-1">{item.label}</p>
              <p className={`text-sm text-slate-900 ${item.className || "font-medium"}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Remarks Section */}
        {enrollment.remarks && (
          <>
            <div className="my-6">
              <Separator />
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Remarks</p>
              <p className="text-sm text-slate-700 leading-relaxed">{enrollment.remarks}</p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
<div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end">
  {enrollment.paymentStatus === "UNPAID" ? (
    <PaymentButton
      enrollmentId={enrollment.id}
    />
  ) : (
    <Button
      disabled
      variant="outline"
      className="font-semibold"
    >
      Payment Completed
    </Button>
  )}
</div>
    </Card>
  );
}