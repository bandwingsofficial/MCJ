"use client";

import type { ReactNode } from "react";

import { Card } from "@/src/shared/components/ui/card";

interface SectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function BatchManageSection({
  title,
  description,
  action,
  children,
}: SectionProps) {
  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-0 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#102A56]">{title}</h2>
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
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-[#102A56]">
        {value}
      </dd>
    </div>
  );
}

export function BatchManageEmptyMessage({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-[#647A9B]">
      {message}
    </p>
  );
}
