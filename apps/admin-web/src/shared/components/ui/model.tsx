"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

interface ModalProps {
  open: boolean;

  title: string;

  children: React.ReactNode;

  onClose: () => void;

  contentClassName?: string;
}

export function Modal({
  open,
  title,
  children,
  onClose,
  contentClassName,
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
    "fixed left-1/2 top-1/2 z-50",
    "w-[calc(100vw-2rem)] max-w-5xl",
    "-translate-x-1/2 -translate-y-1/2",
    "max-h-[90vh]",
    "overflow-x-hidden",
    "rounded-2xl border border-slate-200 bg-white p-6 shadow-xl",
    contentClassName,
  )}
>
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold">
              {title}
            </Dialog.Title>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}