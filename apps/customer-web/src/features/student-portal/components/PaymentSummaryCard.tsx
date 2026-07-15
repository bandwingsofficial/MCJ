"use client";

import {
  BadgeIndianRupee,
  CheckCircle2,
  CreditCard,
  Wallet,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import type {
  StudentPortalEnrollment,
  StudentPortalPaymentSummary,
} from "@/src/features/student-portal/types/student-portal.types";

interface PaymentSummaryCardProps {
  enrollment: StudentPortalEnrollment;

  paymentSummary: StudentPortalPaymentSummary;
}

export function PaymentSummaryCard({
  enrollment,
  paymentSummary,
}: PaymentSummaryCardProps) {
  const isPaid =
    enrollment.paymentStatus ===
    "PAID";

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <Wallet className="h-6 w-6 text-primary" />

        <div>
          <h3 className="text-lg font-semibold">
            Payment Summary
          </h3>

          <p className="text-sm text-muted-foreground">
            Fee and payment information
          </p>
        </div>

        <div className="ml-auto">
          <Badge
            variant={
              isPaid
                ? "success"
                : "warning"
            }
          >
            {enrollment.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeIndianRupee className="h-4 w-4 text-primary" />

            <span className="text-muted-foreground">
              Course Fee
            </span>
          </div>

          <span className="font-semibold">
            ₹
            {
              paymentSummary.feeAmount
            }
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-600" />

            <span className="text-muted-foreground">
              Discount
            </span>
          </div>

          <span className="font-semibold text-green-600">
            - ₹
            {
              paymentSummary.discountAmount
            }
          </span>
        </div>

        <div className="border-t pt-5">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Final Amount
            </span>

            <span className="text-xl font-bold">
              ₹
              {
                paymentSummary.finalAmount
              }
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Paid Amount
          </span>

          <span className="font-semibold text-green-600">
            ₹
            {
              paymentSummary.paidAmount
            }
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Due Amount
          </span>

          <span
            className={
              paymentSummary.dueAmount >
              0
                ? "font-semibold text-red-600"
                : "font-semibold"
            }
          >
            ₹
            {
              paymentSummary.dueAmount
            }
          </span>
        </div>

        <div className="border-t pt-5">
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />

              <span className="font-medium">
                Payment Status
              </span>
            </div>

            <Badge
              variant={
                isPaid
                  ? "success"
                  : "warning"
              }
            >
              {enrollment.paymentStatus}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}