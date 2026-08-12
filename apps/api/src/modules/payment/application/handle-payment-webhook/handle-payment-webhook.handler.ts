import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { InvalidWebhookSignatureException } from '../../domain/errors/payment-business.exception';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { PaymentGatewayPort } from '../../domain/services/payment-gateway.port';
import { PaymentEnrollmentSyncService } from '../shared/payment-enrollment-sync.service';

import { HandlePaymentWebhookCommand } from './handle-payment-webhook.command';
import { HandlePaymentWebhookResult } from './handle-payment-webhook.result';

interface RazorpayEntity {
  id?: string;
  order_id?: string;
  payment_id?: string;
}

interface RazorpayWebhookBody {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayEntity };
    refund?: { entity?: RazorpayEntity };
  };
}

export class HandlePaymentWebhookHandler {
  private readonly logger = new Logger(
    HandlePaymentWebhookHandler.name,
  );

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly gateway: PaymentGatewayPort,
    private readonly enrollmentSync: PaymentEnrollmentSyncService,
  ) {}

  async execute(
    command: HandlePaymentWebhookCommand,
  ): Promise<HandlePaymentWebhookResult> {
    if (
      !command.signature ||
      !this.gateway.verifyWebhookSignature(
        command.rawBody,
        command.signature,
      )
    ) {
      throw new InvalidWebhookSignatureException();
    }

    const body = this.parseBody(command.rawBody);
    const event = body.event ?? null;

    let handled = false;

    switch (event) {
      case 'payment.captured':
        handled = await this.handleCaptured(body);
        break;
      case 'payment.failed':
        handled = await this.handleFailed(body);
        break;
      case 'refund.processed':
        handled = await this.handleRefund(body);
        break;
      default:
        this.logger.log(`Ignoring webhook event: ${event}`);
    }

    return new HandlePaymentWebhookResult(true, event, handled);
  }

  private async handleCaptured(
    body: RazorpayWebhookBody,
  ): Promise<boolean> {
    const entity = body.payload?.payment?.entity;
    const orderId = entity?.order_id;
    const paymentId = entity?.id;

    if (!orderId) {
      return false;
    }

    const payment = await this.paymentRepo.findByGatewayOrderId(
      orderId,
      true,
    );

    // Idempotency: only act on a still-pending payment so duplicate
    // captured events never double-apply enrollment side effects.
    if (!payment || !payment.isPending()) {
      return false;
    }

    payment.markSuccess({
      gatewayPaymentId: paymentId,
      paidAt: new Date(),
    });

    await this.paymentRepo.save(payment);
    await this.enrollmentSync.applyPaymentSuccess(payment);

    this.logger.log(
      `✅ Webhook captured payment: ${payment.id}`,
    );

    return true;
  }

  private async handleFailed(
    body: RazorpayWebhookBody,
  ): Promise<boolean> {
    const entity = body.payload?.payment?.entity;
    const orderId = entity?.order_id;

    if (!orderId) {
      return false;
    }

    const payment = await this.paymentRepo.findByGatewayOrderId(
      orderId,
      true,
    );

    if (!payment || !payment.isPending()) {
      return false;
    }

    payment.markFailed();
    await this.paymentRepo.save(payment);

    this.logger.log(`⚠️ Webhook failed payment: ${payment.id}`);

    return true;
  }

  private async handleRefund(
    body: RazorpayWebhookBody,
  ): Promise<boolean> {
    const entity = body.payload?.refund?.entity;
    const paymentId = entity?.payment_id;

    if (!paymentId) {
      return false;
    }

    const payment =
      await this.paymentRepo.findByGatewayPaymentId(
        paymentId,
        true,
      );

    // Idempotency: skip if already refunded.
    if (!payment || !payment.isSuccessful()) {
      return false;
    }

    payment.markRefunded();
    await this.paymentRepo.save(payment);
    await this.enrollmentSync.applyRefund(payment);

    this.logger.log(`↩️ Webhook refunded payment: ${payment.id}`);

    return true;
  }

  private parseBody(rawBody: string): RazorpayWebhookBody {
    try {
      return JSON.parse(rawBody) as RazorpayWebhookBody;
    } catch {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid webhook payload.',
        400,
      );
    }
  }
}
