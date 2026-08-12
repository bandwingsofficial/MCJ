"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { cn } from "@/src/shared/lib/cn";

interface DropdownItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
}

export function Dropdown({
  trigger,
  items,
}: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[160px] rounded-lg border bg-white p-1 shadow-lg"
          sideOffset={4}
          onCloseAutoFocus={(event) => {
            // Prevent focus restore from stealing the confirm dialog open
            event.preventDefault();
          }}
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-sm outline-none",
                item.destructive
                  ? "text-red-600 hover:bg-red-50 focus:bg-red-50"
                  : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
              )}
              onSelect={() => {
                // Defer so the menu can close before opening confirmation dialogs
                window.setTimeout(() => {
                  item.onClick();
                }, 0);
              }}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
