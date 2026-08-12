"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { Button } from "@/src/shared/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;

  title: string;

  description: string;

  loading?: boolean;

  confirmLabel?: string;

  loadingLabel?: string;

  onConfirm: () => void;

  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  loading,
  confirmLabel = "Confirm",
  loadingLabel,
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
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />

        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(450px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold text-slate-900">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-sm text-slate-500">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onCancel}
              >
                Cancel
              </Button>
            </AlertDialog.Cancel>

            <Button
              type="button"
              loading={loading}
              variant="danger"
              disabled={loading}
              onClick={(event) => {
                event.preventDefault();
                if (loading) {
                  return;
                }
                onConfirm();
              }}
            >
              {loading
                ? loadingLabel ?? confirmLabel
                : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
