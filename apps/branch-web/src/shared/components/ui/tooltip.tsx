"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({
  content,
  children,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={5}
            className="z-50 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}