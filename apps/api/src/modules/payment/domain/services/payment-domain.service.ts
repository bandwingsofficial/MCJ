import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Payment } from '../entities/payment.entity';
import {
  PaymentAccessDeniedException,
  PaymentDeletedException,
  PaymentNotDeletedException,
} from '../errors/payment-business.exception';
import { PaymentNotFoundException } from '../errors/payment-not-found.exception';
import type {
  PaymentDetailView,
  PaymentRepository,
} from '../repositories/payment.repository';

@Injectable()
export class PaymentDomainService {
  ensureExists(payment: Payment | null): Payment {
    if (!payment) {
      throw new PaymentNotFoundException();
    }

    return payment;
  }

  ensureDetailExists(
    payment: PaymentDetailView | null,
  ): PaymentDetailView {
    if (!payment) {
      throw new PaymentNotFoundException();
    }

    return payment;
  }

  ensureNotDeleted(payment: Payment): void {
    if (payment.isDeleted) {
      throw new PaymentDeletedException();
    }
  }

  ensureDeleted(payment: Payment): void {
    if (!payment.isDeleted) {
      throw new PaymentNotDeletedException();
    }
  }

  // A student may only access payments belonging to their own enrollments.
  ensureStudentOwnership(
    payment: Payment,
    studentId: string,
  ): void {
    if (payment.studentId !== studentId) {
      throw new PaymentAccessDeniedException();
    }
  }

  ensureStudentOwnershipById(
    paymentStudentId: string,
    studentId: string,
  ): void {
    if (paymentStudentId !== studentId) {
      throw new PaymentAccessDeniedException();
    }
  }

  async generateUniquePaymentNumber(
    paymentRepo: PaymentRepository,
  ): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const paymentNumber = `PAY-${randomUUID()
        .replace(/-/g, '')
        .slice(0, 10)
        .toUpperCase()}`;

      const existing =
        await paymentRepo.findByPaymentNumber(paymentNumber, true);

      if (!existing) {
        return paymentNumber;
      }
    }

    return `PAY-${Date.now().toString(36).toUpperCase()}`;
  }
}
