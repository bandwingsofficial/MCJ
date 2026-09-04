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
  branchId?: string;
  courseId?: string;
  remarks?: string;
  isFree: boolean;
}

interface CompleteEnrollmentCheckoutResult {
  status: EnrollmentCheckoutStatus;
  enrollment: Enrollment;
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
  const { pay, isLoading: isPaying } = usePayment();
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

      const enrollment = await createEnrollment({
        batchId: input.batchId,
        branchId: input.branchId,
        courseId: input.courseId,
        remarks: input.remarks,
      });

      if (!enrollment) {
        return null;
      }

      const isFree =
        input.isFree ||
        enrollment.finalAmount <= 0 ||
        enrollment.dueAmount <= 0;

      const requiresPayment =
        !isFree &&
        enrollment.dueAmount > 0 &&
        enrollment.paymentStatus !== "PAID";

      if (!requiresPayment) {
        const updatedEnrollment =
          await enrollmentService.getEnrollment(enrollment.id);

        return {
          status: "success_free",
          enrollment: updatedEnrollment,
        };
      }

      try {
        await pay(enrollment.id);

        const updatedEnrollment =
          await enrollmentService.getEnrollment(enrollment.id);

        return {
          status: "success_paid",
          enrollment: updatedEnrollment,
        };
      } catch (error) {
        if (isPaymentCancelledError(error)) {
          return {
            status: "payment_cancelled",
            enrollment,
          };
        }

        const message =
          error instanceof Error
            ? error.message
            : "Payment failed. Please try again.";

        setCheckoutError(message);

        return {
          status: "failed",
          enrollment,
        };
      }
    },
    [clearError, createEnrollment, isPaying, isSubmitting, pay],
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
