import type {
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
} from "@/src/features/payments/types/payment.types";

export const PAYMENT_GATEWAYS: Record<
  PaymentGateway,
  PaymentGateway
> = {
  RAZORPAY: "RAZORPAY",
};

export const PAYMENT_METHODS: Record<
  PaymentMethod,
  PaymentMethod
> = {
  RAZORPAY: "RAZORPAY",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} satisfies Record<
  PaymentStatus,
  PaymentStatus
>;

export const PAYMENT_STATUS_LABELS: Record<
  PaymentStatus,
  string
> = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const DEFAULT_PAYMENT_CURRENCY =
  "INR";

export const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

export const PAYMENT_MESSAGES = {
  ORDER_CREATED:
    "Payment order created successfully.",

  PAYMENT_SUCCESS:
    "Payment completed successfully.",

  PAYMENT_FAILED:
    "Payment failed. Please try again.",

  PAYMENT_CANCELLED:
    "Payment cancelled by user.",

  PAYMENT_VERIFY_FAILED:
    "Unable to verify payment.",

  GATEWAY_NOT_CONFIGURED:
    "Payment gateway is not configured.",
} as const;