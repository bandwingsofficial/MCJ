"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { cn } from "@/src/shared/lib/cn";

interface SectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function BatchManageSection({
  title,
  description,
  action,
  children,
  className,
}: SectionProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-2 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#102A56]">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-[#647A9B]">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

export function BatchManageField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-[#102A56]">
        {value}
      </dd>
    </div>
  );
}

export function BatchManageEmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center">
      {Icon ? (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FBFF] text-[#647A9B] ring-1 ring-[#DCE8F5]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-[#102A56]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#647A9B]">{description}</p>
    </div>
  );
}

/** @deprecated Use BatchManageEmptyState for new empty states. */
export function BatchManageEmptyMessage({ message }: { message: string }) {
  return (
    <BatchManageEmptyState
      title="No Data Available"
      description={message}
    />
  );
}
