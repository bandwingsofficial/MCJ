"use client";

import {
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";

interface PaymentFailedDialogProps {
  open: boolean;

  message: string;

  onRetry: () => void;

  onClose: () => void;
}

export function PaymentFailedDialog({
  open,
  message,
  onRetry,
  onClose,
}: PaymentFailedDialogProps) {
  return (
    <Modal
      open={open}
      title="Payment Failed"
      onClose={
        onClose
      }
    >
      <div className="space-y-6 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-600" />

        <p className="text-muted-foreground">
          {message}
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={
              onClose
            }
            className="flex-1"
          >
            Close
          </Button>

          <Button
            onClick={
              onRetry
            }
            className="flex-1"
          >
            Retry Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
}