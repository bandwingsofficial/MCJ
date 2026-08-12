// Abstraction over an external payment gateway (Razorpay today). Keeping this
// behind a port lets future gateways (Stripe, PhonePe, PayPal) be added without
// touching the application or domain layers.

export interface CreateGatewayOrderParams {
  amount: number; // major currency unit (e.g. rupees)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface GatewayOrder {
  orderId: string;
  amount: number; // major currency unit
  currency: string;
}

export interface VerifyGatewaySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentGatewayPort {
  getPublicKey(): string;
  createOrder(
    params: CreateGatewayOrderParams,
  ): Promise<GatewayOrder>;
  verifyPaymentSignature(
    params: VerifyGatewaySignatureParams,
  ): boolean;
  verifyWebhookSignature(
    rawBody: string,
    signature: string,
  ): boolean;
}
