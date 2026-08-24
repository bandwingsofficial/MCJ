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

  /** When false, only the primary action button is shown (e.g. Close). */
  showCancel?: boolean;

  confirmVariant?: "primary" | "danger" | "success" | "outline";

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
  showCancel = true,
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
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />

        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(450px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold text-slate-900">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 whitespace-pre-line text-sm text-slate-500">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            {showCancel ? (
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
            ) : null}

            <Button
              type="button"
              loading={loading}
              variant={confirmVariant}
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
