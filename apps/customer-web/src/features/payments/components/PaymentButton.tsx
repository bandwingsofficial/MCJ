"use client";

import { useRouter } from "next/navigation";

import {
  CreditCard,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { appToast } from "@/src/shared/components/ui/toast";

import { usePayment } from "@/src/features/payments/hooks/use-payment";

interface PaymentButtonProps {
  enrollmentId: string;

  onSuccess?: () => void;
}

export function PaymentButton({
  enrollmentId,
  onSuccess,
}: PaymentButtonProps) {
  const router =
    useRouter();

  const {
    pay,
    isLoading,
  } = usePayment();

  const handlePayment =
    async () => {
      try {
        await pay(
          enrollmentId,
        );

        appToast.success(
          "Payment completed successfully.",
        );

        onSuccess?.();

        router.push(
          "/student/my-learning",
        );

        router.refresh();
      } catch (error) {
        appToast.error(
          error instanceof Error
            ? error.message
            : "Payment failed. Please try again.",
        );
      }
    };

  return (
    <Button
      loading={
        isLoading
      }
      disabled={
        isLoading
      }
      onClick={
        handlePayment
      }
      className="w-full"
    >
      <CreditCard className="mr-2 h-4 w-4" />

      {isLoading
        ? "Processing Payment..."
        : "Pay Now"}
    </Button>
  );
}