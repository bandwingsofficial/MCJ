"use client";

import {
  useCallback,
  useState,
} from "react";

import { paymentService } from "@/src/features/payments/services/payment.service";

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
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const pay =
    useCallback(
      async (
        enrollmentId: string,
      ) => {
        try {
          setIsLoading(true);

          /**
           * Step 1
           * Create Razorpay Order
           */
          const order =
            await paymentService.createOrder(
              {
                enrollmentId,
              },
            );

          /**
           * Step 2
           * Open Razorpay Checkout
           */
          const payment =
            await openRazorpayCheckout(
              {
                key:
                  order.keyId,

                amount:
                  order.amount,

                currency:
                  order.currency,

                orderId:
                  order.orderId,

                name:
                  "MCJ Learning",

                description:
                  "Course Enrollment Payment",
              },
            );

          /**
           * Step 3
           * Verify Payment
           */
          await paymentService.verifyPayment(
            {
              enrollmentId,

              razorpayOrderId:
                payment.razorpay_order_id,

              razorpayPaymentId:
                payment.razorpay_payment_id,

              razorpaySignature:
                payment.razorpay_signature,
            },
          );
        } finally {
          setIsLoading(false);
        }
      },
      [],
    );

  return {
    isLoading,
    pay,
  };
}