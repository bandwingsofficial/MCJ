"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function Drawer({
  open,
  title,
  children,
  onClose,
}: DrawerProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onClose}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />

        <Dialog.Content className="fixed right-0 top-0 z-50 h-screen w-full max-w-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="text-lg font-semibold">
              {title}
            </h2>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="h-[calc(100vh-72px)] overflow-y-auto p-5">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}