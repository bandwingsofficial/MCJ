"use client";

interface Props {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/** Truncated table cell with native tooltip on hover */
export function TruncatedCell({ children, title, className = "" }: Props) {
  const label =
    title ?? (typeof children === "string" ? children : undefined);

  return (
    <span className={`block truncate ${className}`} title={label}>
      {children}
    </span>
  );
}

export const DASHBOARD_TABLE =
  "w-full table-fixed border-collapse text-left";

export const DASHBOARD_TABLE_HEAD =
  "border-b border-[#E8EEF5] text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]";

export const DASHBOARD_TABLE_ROW =
  "border-b border-[#E8EEF5] last:border-0";

export const DASHBOARD_TABLE_CELL = "py-2.5 pr-2 align-middle";
