"use client";

import type { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface Props {
  columns: Column[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage: string;
  emptyDescription?: string;
  children?: ReactNode;
}

export function BranchManageTableShell({
  columns,
  isLoading = false,
  isEmpty = false,
  emptyMessage,
  emptyDescription,
  children,
}: Props) {
  const colSpan = columns.length;

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[40rem] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${column.className ?? ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {isLoading ? (
            <tr>
              <td
                colSpan={colSpan}
                className="px-4 py-12 text-center text-sm text-slate-500"
              >
                Loading...
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={colSpan} className="px-4 py-12 text-center">
                <p className="text-sm font-medium text-slate-900">
                  {emptyMessage}
                </p>
                {emptyDescription ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {emptyDescription}
                  </p>
                ) : null}
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
