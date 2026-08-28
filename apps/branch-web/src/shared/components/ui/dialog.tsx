"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { Button } from "@/src/shared/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger" | "outline";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  loading,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) {
          onCancel();
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[70] bg-black/50" />

        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[min(450px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold text-[#102A56]">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 whitespace-pre-line text-sm text-[#647A9B]">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Button
              type="button"
              loading={loading}
              variant={confirmVariant}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
