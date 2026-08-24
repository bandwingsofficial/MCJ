"use client";

import {
  useCallback,
  useState,
} from "react";

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

  return {
    isLoading,
    pay,
  };
}
