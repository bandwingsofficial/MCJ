import {
  RAZORPAY_SCRIPT_URL,
} from "@/src/features/payments/constants/payment.constants";

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface OpenRazorpayCheckoutOptions {
  key: string;

  amount: number;

  currency: string;

  orderId: string;

  name?: string;

  description?: string;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (
      options: Record<
        string,
        unknown
      >,
    ) => {
      open(): void;
    };
  }
}

/**
 * Dynamically loads Razorpay SDK.
 */
export async function loadRazorpaySdk(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.Razorpay) {
    return true;
  }

  return new Promise(
    (resolve) => {
      const script =
        document.createElement(
          "script",
        );

      script.src =
        RAZORPAY_SCRIPT_URL;

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror =
        () => resolve(false);

      document.body.appendChild(
        script,
      );
    },
  );
}

/**
 * Opens Razorpay Checkout.
 */
export async function openRazorpayCheckout(
  options: OpenRazorpayCheckoutOptions,
): Promise<RazorpaySuccessResponse> {
  const loaded =
    await loadRazorpaySdk();

  if (!loaded) {
    throw new Error(
      "Failed to load Razorpay SDK.",
    );
  }

  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const razorpay =
        new window.Razorpay({
          key: options.key,

          amount:
            options.amount,

          currency:
            options.currency,

          order_id:
            options.orderId,

          name:
            options.name ??
            "MCJ Learning",

          description:
            options.description ??
            "Course Payment",

          prefill:
            options.prefill,

          handler: (
            response: RazorpaySuccessResponse,
          ) => {
            resolve(
              response,
            );
          },

          modal: {
            ondismiss:
              () => {
                reject(
                  new Error(
                    "Payment cancelled by user.",
                  ),
                );
              },
          },

          theme: {
            color:
              "#2563EB",
          },
        });

      razorpay.open();
    },
  );
}