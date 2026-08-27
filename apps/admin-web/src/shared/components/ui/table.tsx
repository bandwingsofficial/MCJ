import * as React from "react";

import { cn } from "@/src/shared/lib/cn";

export function Table({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white shadow-[0_2px_10px_rgba(16,42,86,0.05)]",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <thead className="bg-[#F6F9FD]">
      {children}
    </thead>
  );
}

export function TableBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return <tbody>{children}</tbody>;
}

export function TableRow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  children: React.ReactNode;
}) {
  return (
    <tr
      className={cn(
        "border-b border-[#EAF0F7] last:border-0 transition-colors hover:bg-[#F4F9FF]",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-3.5 py-3.5 text-left text-[14px] font-semibold uppercase tracking-wide text-[#647A9B]",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3.5 py-[1.05rem] text-[15px] text-[#102A56]",
        className
      )}
    >
      {children}
    </td>
  );
}
