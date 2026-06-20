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
    case PaymentStatus.PENDING:
      return (
        <Badge variant="warning">
          Pending
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

    case PaymentStatus.REFUNDED:
      return (
        <Badge>
          Refunded
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