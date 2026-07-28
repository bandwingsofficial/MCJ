"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import { PaymentStatus } from "../../types";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({
  status,
}: PaymentStatusBadgeProps) {
  switch (status) {
    case PaymentStatus.UNPAID:
      return (
        <Badge variant="warning">
          Unpaid
        </Badge>
      );

    case PaymentStatus.PARTIAL:
      return (
        <Badge variant="info">
          Partial
        </Badge>
      );

    case PaymentStatus.PAID:
      return (
        <Badge variant="success">
          Paid
        </Badge>
      );

    default:
      return (
        <Badge>
          {status}
        </Badge>
      );
  }
}