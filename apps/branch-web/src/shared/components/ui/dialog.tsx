"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { Button } from "@/src/shared/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;

  title: string;

  description: string;

  loading?: boolean;

  onConfirm: () => void;

  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />

        <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-sm text-slate-500">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Button
              loading={loading}
              variant="danger"
              onClick={onConfirm}
            >
              Confirm
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}