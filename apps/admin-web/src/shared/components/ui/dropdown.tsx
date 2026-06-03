"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface DropdownItem {
  label: string;
  onClick: () => void;
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
          className="z-50 min-w-[180px] rounded-xl border bg-white p-1 shadow-lg"
          sideOffset={5}
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              onClick={item.onClick}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100"
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}