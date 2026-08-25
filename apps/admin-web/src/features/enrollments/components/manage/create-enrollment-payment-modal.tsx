"use client";

import { useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  ENROLLMENT_PAYMENT_METHODS,
  paymentReferenceLabel,
  requiresPaymentReference,
  todayDateInputValue,
  type EnrollmentPaymentMethod,
} from "@/src/features/enrollments/constants/enrollment-create.constants";
import type { Enrollment } from "@/src/features/enrollments/types";
import {
  formatCurrency,
  normalizeMoney,
} from "@/src/features/enrollments/utils/format-payment";
import { paymentService } from "@/src/features/payments/services/payment.service";
import type { PaymentMethod } from "@/src/features/payments/types/payment.types";

interface Props {
  open: boolean;
  enrollment: Enrollment;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export function CreateEnrollmentPaymentModal({
  open,
  enrollment,
  onClose,
  onSuccess,
}: Props) {
  const totalFee = normalizeMoney(
    enrollment.finalAmount || enrollment.feeAmount,
  );
  const alreadyPaid = normalizeMoney(enrollment.paidAmount);
  const remaining = Math.max(0, normalizeMoney(enrollment.dueAmount));

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<EnrollmentPaymentMethod>("CASH");
  const [paymentDate, setPaymentDate] = useState(todayDateInputValue());
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payingNow = normalizeMoney(amount);
  const nextRemaining = Math.max(0, remaining - payingNow);

  const canSubmit = useMemo(() => {
    return payingNow > 0 && payingNow <= remaining && remaining > 0;
  }, [payingNow, remaining]);

  const handleSubmit = async () => {
    if (remaining <= 0) {
      appToast.error("This enrollment is already fully paid.");
      return;
    }

    if (payingNow <= 0) {
      appToast.error("Enter an amount greater than zero.");
      return;
    }

    if (payingNow > remaining) {
      appToast.error("Amount paying now cannot exceed the remaining amount.");
      return;
    }

    if (requiresPaymentReference(paymentMethod) && !transactionId.trim()) {
      appToast.error("Payment reference is required for the selected method.");
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentService.createPayment({
        enrollmentId: enrollment.id,
        amount: payingNow,
        paymentMethod: paymentMethod as PaymentMethod,
        transactionId: transactionId.trim() || undefined,
        remarks: notes.trim() || undefined,
        paidAt: paymentDate,
      });
      appToast.success("Payment recorded successfully");
      setAmount("");
      setTransactionId("");
      setNotes("");
      await onSuccess();
      onClose();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Create Payment" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-slate-500">Total Fee</p>
            <Input readOnly value={formatCurrency(totalFee)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Already Paid</p>
            <Input readOnly value={formatCurrency(alreadyPaid)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Remaining Amount</p>
            <Input readOnly value={formatCurrency(remaining)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Amount Paying Now</p>
            <Input
              type="number"
              min={0}
              max={remaining}
              step="0.01"
              value={amount}
              placeholder="0.00"
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Remaining After Payment</p>
            <Input readOnly value={formatCurrency(nextRemaining)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Payment Method</p>
            <AppSelect
              value={paymentMethod}
              options={ENROLLMENT_PAYMENT_METHODS.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
              onValueChange={(value) =>
                setPaymentMethod(value as EnrollmentPaymentMethod)
              }
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Payment Date</p>
            <Input
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
            />
          </div>
        </div>

        {requiresPaymentReference(paymentMethod) ? (
          <div>
            <p className="mb-1 text-xs text-slate-500">
              {paymentReferenceLabel(paymentMethod)}
            </p>
            <Input
              value={transactionId}
              placeholder="Enter reference"
              onChange={(event) => setTransactionId(event.target.value)}
            />
          </div>
        ) : null}

        <div>
          <p className="mb-1 text-xs text-slate-500">Notes</p>
          <Input
            value={notes}
            placeholder="Optional notes"
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            loading={isSubmitting}
            disabled={isSubmitting || !canSubmit}
            onClick={() => {
              void handleSubmit();
            }}
          >
            Save Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
