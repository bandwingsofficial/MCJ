"use client";

import { useCallback, useState } from "react";

import { useEnroll } from "@/src/features/enrollments/hooks/useEnroll";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { usePayment } from "@/src/features/payments/hooks/use-payment";
import { isPaymentCancelledError } from "@/src/features/payments/utils/payment-errors";

export type EnrollmentCheckoutStatus =
  | "success_free"
  | "success_paid"
  | "payment_cancelled"
  | "failed";

interface CompleteEnrollmentCheckoutInput {
  batchId: string;
  batchTimingId: string;
  branchId?: string;
  courseId?: string;
  isFree: boolean;
  coinsToApply?: number;
}

interface CompleteEnrollmentCheckoutResult {
  status: EnrollmentCheckoutStatus;
  enrollment: Enrollment | null;
}

interface UseEnrollmentCheckoutReturn {
  completeCheckout: (
    input: CompleteEnrollmentCheckoutInput,
  ) => Promise<CompleteEnrollmentCheckoutResult | null>;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
}

export function useEnrollmentCheckout(): UseEnrollmentCheckoutReturn {
  const { createEnrollment, isSubmitting, error, clearError } = useEnroll();
  const { payAdvanceCheckout, isLoading: isPaying } = usePayment();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const completeCheckout = useCallback(
    async (
      input: CompleteEnrollmentCheckoutInput,
    ): Promise<CompleteEnrollmentCheckoutResult | null> => {
      if (isSubmitting || isPaying) {
        return null;
      }

      clearError();
      setCheckoutError(null);

      const isFree =
        input.isFree;

      if (isFree) {
        const enrollment = await createEnrollment({
          batchId: input.batchId,
          branchId: input.branchId,
          courseId: input.courseId,
          batchTimingId: input.batchTimingId,
        });

        if (!enrollment) {
          return null;
        }

        const updatedEnrollment =
          await enrollmentService.getEnrollment(enrollment.id);

        return {
          status: "success_free",
          enrollment: updatedEnrollment,
        };
      }

      if (!input.branchId || !input.courseId) {
        setCheckoutError("Missing branch or course for checkout.");
        return null;
      }

      try {
        const order = await enrollmentService.createCheckoutOrder({
          batchId: input.batchId,
          batchTimingId: input.batchTimingId,
          branchId: input.branchId,
          courseId: input.courseId,
          coinsToRedeem: input.coinsToApply ?? 0,
        });

        const enrollmentId = await payAdvanceCheckout(order);

        if (!enrollmentId) {
          throw new Error("Payment verified but enrollment was not created.");
        }

        const updatedEnrollment =
          await enrollmentService.getEnrollment(enrollmentId);

        return {
          status: "success_paid",
          enrollment: updatedEnrollment,
        };
      } catch (error) {
        if (isPaymentCancelledError(error)) {
          return {
            status: "payment_cancelled",
            enrollment: null,
          };
        }

        const message =
          error instanceof Error
            ? error.message
            : "Payment failed. Please try again.";

        setCheckoutError(message);

        return {
          status: "failed",
          enrollment: null,
        };
      }
    },
    [clearError, createEnrollment, isPaying, isSubmitting, payAdvanceCheckout],
  );

  return {
    completeCheckout,
    isProcessing: isSubmitting || isPaying,
    error: checkoutError ?? error,
    clearError: () => {
      clearError();
      setCheckoutError(null);
    },
  };
}
