"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";

import type {
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";

interface EnrollmentCardProps {
  enrollment: Enrollment;
}

function getStatusVariant(
  status: Enrollment["status"],
):
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "default" {
  switch (status) {
    case "ADMITTED":
      return "success";

    case "PENDING":
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
):
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "default" {
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

export function EnrollmentCard({
  enrollment,
}: EnrollmentCardProps) {
  const trainer =
    enrollment.batch.trainers[0];

  return (
    <Card className="p-6">

      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">

        <div className="space-y-4 flex-1">

          <div>

            <h2 className="text-xl font-semibold">
              {enrollment.course.title}
            </h2>

            <p className="text-sm text-muted-foreground">
              {enrollment.category.name}
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <Badge
              variant={getStatusVariant(
                enrollment.status,
              )}
            >
              {enrollment.status}
            </Badge>

            <Badge
              variant={getPaymentVariant(
                enrollment.paymentStatus,
              )}
            >
              {enrollment.paymentStatus}
            </Badge>

          </div>

        </div>

        <div className="text-right">

          <div className="text-sm text-muted-foreground">
            Enrollment No.
          </div>

          <div className="font-semibold">
            {enrollment.enrollmentNumber}
          </div>

        </div>

      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        <div>

          <p className="text-sm text-muted-foreground">
            Batch
          </p>

          <p className="font-medium">
            {enrollment.batch.name}
          </p>

        </div>

        <div>

          <p className="text-sm text-muted-foreground">
            Trainer
          </p>

          <p className="font-medium">
            {trainer
              ? `${trainer.firstName} ${trainer.lastName}`
              : "--"}
          </p>

        </div>

        <div>

          <p className="text-sm text-muted-foreground">
            Branch
          </p>

          <p className="font-medium">
            {enrollment.branch.branchName}
          </p>

        </div>

        <div>

          <p className="text-sm text-muted-foreground">
            Joining Date
          </p>

          <p className="font-medium">
            {new Date(
              enrollment.joiningDate,
            ).toLocaleDateString()}
          </p>

        </div>

        <div>

          <p className="text-sm text-muted-foreground">
            Expected Completion
          </p>

          <p className="font-medium">
            {new Date(
              enrollment.expectedCompletionDate,
            ).toLocaleDateString()}
          </p>

        </div>

        <div>

          <p className="text-sm text-muted-foreground">
            Amount
          </p>

          <p className="font-semibold">
            ₹
            {enrollment.finalAmount}
          </p>

        </div>

      </div>

      {enrollment.remarks && (
        <>
          <Separator  />

          <div>

            <p className="text-sm text-muted-foreground mb-2">
              Remarks
            </p>

            <p>
              {enrollment.remarks}
            </p>

          </div>
        </>
      )}

      <Separator  />

      <div className="flex justify-end">

        <Button
          variant="outline"
        >
          View Details
        </Button>

      </div>

    </Card>
  );
}