"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

const TABLE_HEAD_CLASS =
  "!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]";

const TABLE_CELL_CLASS = "!px-4 !py-4 align-middle text-sm";

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface Props {
  columns: Column[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  embedded?: boolean;
  children?: ReactNode;
}

export function BranchManageTableShell({
  columns,
  isLoading = false,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  emptyIcon: EmptyIcon,
  embedded = false,
  children,
}: Props) {
  const colSpan = columns.length;

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-x-auto",
        !embedded &&
          "rounded-xl border border-[#E1EBF5] bg-white shadow-sm",
      )}
    >
      <table className="w-full table-fixed border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${TABLE_HEAD_CLASS} ${column.className ?? ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column.key} className={TABLE_CELL_CLASS}>
                    <Skeleton className="h-4 w-full max-w-[12rem]" />
                  </td>
                ))}
              </tr>
            ))
          ) : isEmpty ? (
            <tr>
              <td colSpan={colSpan} className="!px-4 !py-4 align-middle">
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  {EmptyIcon ? (
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FBFF] text-[#647A9B] ring-1 ring-[#DCE8F5]">
                      <EmptyIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  ) : null}
                  <h3 className="text-base font-semibold">{emptyTitle}</h3>
                  {emptyDescription ? (
                    <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                      {emptyDescription}
                    </p>
                  ) : null}
                </div>
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export { TABLE_CELL_CLASS };
