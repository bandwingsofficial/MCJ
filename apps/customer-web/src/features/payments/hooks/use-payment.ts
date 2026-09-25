"use client";

import {
  useCallback,
  useState,
} from "react";

import type { CreatePaymentOrderResponse } from "@/src/features/payments/types/payment.types";
import { paymentService } from "@/src/features/payments/services/payment.service";
import { PaymentCancelledError } from "@/src/features/payments/utils/payment-errors";
import {
  openRazorpayCheckout,
} from "@/src/features/payments/utils/razorpay.utils";

interface UsePaymentReturn {
  isLoading: boolean;

  pay: (
    enrollmentId: string,
  ) => Promise<void>;

  payAdvanceCheckout: (
    order: CreatePaymentOrderResponse,
  ) => Promise<string>;
}

export function usePayment(): UsePaymentReturn {
  const [isLoading, setIsLoading] = useState(false);

  const pay = useCallback(async (enrollmentId: string) => {
    try {
      setIsLoading(true);

      const order = await paymentService.createOrder({
        enrollmentId,
      });

      const payment = await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        orderId: order.orderId,
        name: "MCJ Learning",
        description: "Course Enrollment Payment",
      });

      await paymentService.verifyPayment({
        enrollmentId,
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Payment cancelled by user."
      ) {
        throw new PaymentCancelledError();
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const payAdvanceCheckout = useCallback(
    async (order: CreatePaymentOrderResponse): Promise<string> => {
      try {
        setIsLoading(true);

        const payment = await openRazorpayCheckout({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          orderId: order.orderId,
          name: "MCJ Learning",
          description: "Course enrollment advance payment",
        });

        const verified = await paymentService.verifyPayment({
          razorpayOrderId: payment.razorpay_order_id,
          razorpayPaymentId: payment.razorpay_payment_id,
          razorpaySignature: payment.razorpay_signature,
        });

        const enrollmentId = verified.enrollment?.id;
        if (!enrollmentId) {
          throw new Error("Enrollment was not created after payment.");
        }

        return enrollmentId;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Payment cancelled by user."
        ) {
          throw new PaymentCancelledError();
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    isLoading,
    pay,
    payAdvanceCheckout,
  };
}
