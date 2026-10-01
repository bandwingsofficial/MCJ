"use client";

import { useEffect, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { Button } from "@/src/shared/components/ui/button";
import { Textarea } from "@/src/shared/components/ui/textarea";

interface CancelBatchDialogProps {
  open: boolean;
  batchName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelBatchDialog({
  open,
  batchName,
  loading = false,
  onClose,
  onConfirm,
}: CancelBatchDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const trimmedReason = reason.trim();
  const canSubmit = trimmedReason.length > 0 && !loading;

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) {
          onClose();
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[70] bg-black/50" />

        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold text-[#102A56]">
            Cancel Batch
          </AlertDialog.Title>

          <AlertDialog.Description asChild>
            <div className="mt-2 space-y-3 text-sm text-[#647A9B]">
              <p>
                {batchName
                  ? `"${batchName}" will be closed immediately. Students and enrollments are kept for history, but this batch will no longer run as an active ongoing batch.`
                  : "This batch will be closed immediately. Students and enrollments are kept for history, but the batch will no longer run as an active ongoing batch."}
              </p>
              <div>
                <label
                  htmlFor="batch-cancel-reason"
                  className="mb-1.5 block text-sm font-medium text-[#102A56]"
                >
                  Why are you cancelling this batch?
                </label>
                <Textarea
                  id="batch-cancel-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Enter cancellation reason"
                  rows={4}
                  disabled={loading}
                  className="resize-y min-h-[96px]"
                />
              </div>
            </div>
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onClose}
              >
                Keep Batch
              </Button>
            </AlertDialog.Cancel>

            <Button
              type="button"
              variant="danger"
              loading={loading}
              disabled={!canSubmit}
              onClick={(event) => {
                event.preventDefault();
                if (!canSubmit) {
                  return;
                }
                onConfirm(trimmedReason);
              }}
            >
              Cancel Batch
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
