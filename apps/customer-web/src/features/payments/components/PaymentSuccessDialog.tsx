"use client";

import {
  CheckCircle2,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";

interface PaymentSuccessDialogProps {
  open: boolean;

  paymentNumber: string;

  onClose: () => void;

  onContinue: () => void;
}

export function PaymentSuccessDialog({
  open,
  paymentNumber,
  onClose,
  onContinue,
}: PaymentSuccessDialogProps) {
  return (
    <Modal
      open={open}
      title="Payment Successful"
      onClose={
        onClose
      }
    >
      <div className="space-y-6 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />

        <Badge variant="success">
          Success
        </Badge>

        <div className="space-y-2">
          <p className="text-lg font-semibold">
            Enrollment Confirmed
          </p>

          <p className="text-sm text-muted-foreground">
            Your payment has been verified successfully.
          </p>

          <p className="text-xs text-muted-foreground">
            Payment Number
          </p>

          <p className="font-medium">
            {paymentNumber}
          </p>
        </div>

        <Button
          onClick={
            onContinue
          }
          className="w-full"
        >
          Go To My Learning
        </Button>
      </div>
    </Modal>
  );
}