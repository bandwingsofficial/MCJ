"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

interface ModalProps {
  open: boolean;

  title: string;

  description?: string;

  children: React.ReactNode;

  onClose: () => void;

  preventDismiss?: boolean;

  showCloseButton?: boolean;

  layout?: "default" | "scrollable";
}

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  preventDismiss = false,
  showCloseButton = true,
  layout = "default",
}: ModalProps) {
  const isScrollable = layout === "scrollable";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !preventDismiss) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />

        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl",
            isScrollable
              ? "flex max-h-[90vh] flex-col overflow-hidden"
              : "max-h-[90vh] overflow-y-auto p-6",
          )}
          onInteractOutside={(event) => {
            if (preventDismiss) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (preventDismiss) {
              event.preventDefault();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (preventDismiss) {
              event.preventDefault();
            }
          }}
        >
          <div
            className={cn(
              "flex items-start justify-between gap-4 border-b border-slate-100",
              isScrollable ? "shrink-0 px-6 py-5" : "mb-5",
            )}
          >
            <div className="min-w-0">
              <Dialog.Title className="text-xl font-semibold text-slate-900">
                {title}
              </Dialog.Title>

              {description ? (
                <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>

            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>

          {isScrollable ? (
            <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-5">
              {children}
            </div>
          ) : (
            children
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
