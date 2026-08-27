"use client";

import type { RefObject } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

interface ModalProps {
  open: boolean;

  title: string;

  children: React.ReactNode;

  onClose: () => void;

  contentClassName?: string;

  bodyClassName?: string;

  bodyRef?: RefObject<HTMLDivElement | null>;
}

export function Modal({
  open,
  title,
  children,
  onClose,
  contentClassName,
  bodyClassName,
  bodyRef,
}: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />

        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white shadow-[0_16px_40px_rgba(16,42,86,0.12)]",
            contentClassName,
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
            <Dialog.Title className="text-xl font-semibold text-[#102A56]">
              {title}
            </Dialog.Title>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={bodyRef}
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5",
              bodyClassName,
            )}
          >
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
