import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

import {
  PaymentGatewayException,
  PaymentGatewayNotConfiguredException,
} from '../../domain/errors/payment-business.exception';
import type {
  CreateGatewayOrderParams,
  GatewayOrder,
  PaymentGatewayPort,
  VerifyGatewaySignatureParams,
} from '../../domain/services/payment-gateway.port';

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
}

// Razorpay implementation of the gateway port. Uses the public REST API directly
// (no SDK dependency) and Node's crypto for signature verification.
export class RazorpayGatewayService implements PaymentGatewayPort {
  private readonly logger = new Logger(
    RazorpayGatewayService.name,
  );

  private readonly ordersUrl =
    'https://api.razorpay.com/v1/orders';

  constructor(private readonly config: ConfigService) {}

  getPublicKey(): string {
    return this.getKeyId();
  }

  async createOrder(
    params: CreateGatewayOrderParams,
  ): Promise<GatewayOrder> {
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();

    const authHeader = Buffer.from(
      `${keyId}:${keySecret}`,
    ).toString('base64');

    let response: Response;

    try {
      response = await fetch(this.ordersUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          // Razorpay expects the amount in the smallest currency unit (paise).
          amount: Math.round(params.amount * 100),
          currency: params.currency,
          receipt: params.receipt,
          notes: params.notes,
        }),
      });
    } catch (error) {
      this.logger.error('Razorpay order request failed', error);
      throw new PaymentGatewayException(
        'Unable to reach the payment gateway.',
      );
    }

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(
        `Razorpay order creation failed (${response.status}): ${body}`,
      );
      throw new PaymentGatewayException(
        'Failed to create payment order.',
      );
    }

    const order = (await response.json()) as RazorpayOrderResponse;

    return {
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
    };
  }

  verifyPaymentSignature(
    params: VerifyGatewaySignatureParams,
  ): boolean {
    const keySecret = this.getKeySecret();

    const expected = createHmac('sha256', keySecret)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest('hex');

    return this.safeCompare(expected, params.signature);
  }

  verifyWebhookSignature(
    rawBody: string,
    signature: string,
  ): boolean {
    const webhookSecret = this.getWebhookSecret();

    const expected = createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return this.safeCompare(expected, signature);
  }

  private safeCompare(expected: string, actual: string): boolean {
    if (!actual) {
      return false;
    }

    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
  }

  private getKeyId(): string {
    const keyId = this.config.get<string>('RAZORPAY_KEY_ID');

    if (!keyId) {
      throw new PaymentGatewayNotConfiguredException(
        'RAZORPAY_KEY_ID is not configured.',
      );
    }

    return keyId;
  }

  private getKeySecret(): string {
    const keySecret = this.config.get<string>(
      'RAZORPAY_KEY_SECRET',
    );

    if (!keySecret) {
      throw new PaymentGatewayNotConfiguredException(
        'RAZORPAY_KEY_SECRET is not configured.',
      );
    }

    return keySecret;
  }

  private getWebhookSecret(): string {
    const secret = this.config.get<string>(
      'RAZORPAY_WEBHOOK_SECRET',
    );

    if (!secret) {
      throw new PaymentGatewayNotConfiguredException(
        'RAZORPAY_WEBHOOK_SECRET is not configured.',
      );
    }

    return secret;
  }
}
