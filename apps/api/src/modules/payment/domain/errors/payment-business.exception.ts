import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class PaymentAccessDeniedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.PAYMENT_ACCESS_DENIED,
      'You do not have access to this payment.',
      403,
    );
  }
}

export class PaymentDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.PAYMENT_DELETED,
      'Payment has been deleted.',
      400,
    );
  }
}

export class PaymentNotDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.PAYMENT_NOT_DELETED,
      'Only deleted payments can be permanently removed.',
      400,
    );
  }
}

export class PaymentAlreadyProcessedException extends BaseException {
  constructor(
    message = 'Payment has already been processed.',
  ) {
    super(ERROR_CODES.PAYMENT_ALREADY_PROCESSED, message, 400);
  }
}

export class PaymentNotRefundableException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.PAYMENT_NOT_REFUNDABLE,
      'Only successful payments can be refunded.',
      400,
    );
  }
}

export class InvalidPaymentStatusTransitionException extends BaseException {
  constructor(from: string, to: string) {
    super(
      ERROR_CODES.INVALID_PAYMENT_STATUS_TRANSITION,
      `Cannot change payment status from ${from} to ${to}.`,
      400,
    );
  }
}

export class InvalidPaymentAmountException extends BaseException {
  constructor(
    message = 'Payment amount is invalid.',
  ) {
    super(ERROR_CODES.INVALID_PAYMENT_AMOUNT, message, 400);
  }
}

export class InvalidPaymentNumberException extends BaseException {
  constructor(message = 'Payment number is invalid.') {
    super(ERROR_CODES.INVALID_PAYMENT_NUMBER, message, 400);
  }
}

export class PaymentAmountExceedsDueException extends BaseException {
  constructor(
    message = 'Payment amount exceeds the due amount for this enrollment.',
  ) {
    super(ERROR_CODES.PAYMENT_AMOUNT_EXCEEDS_DUE, message, 400);
  }
}

export class EnrollmentAlreadyPaidException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.ENROLLMENT_ALREADY_PAID,
      'This enrollment is already fully paid.',
      400,
    );
  }
}

export class PaymentGatewayNotConfiguredException extends BaseException {
  constructor(
    message = 'Payment gateway is not configured.',
  ) {
    super(ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED, message, 500);
  }
}

export class PaymentGatewayException extends BaseException {
  constructor(
    message = 'Payment gateway request failed.',
  ) {
    super(ERROR_CODES.PAYMENT_GATEWAY_ERROR, message, 502);
  }
}

export class InvalidPaymentSignatureException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.INVALID_PAYMENT_SIGNATURE,
      'Payment signature verification failed.',
      400,
    );
  }
}

export class InvalidWebhookSignatureException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.INVALID_WEBHOOK_SIGNATURE,
      'Webhook signature verification failed.',
      400,
    );
  }
}
