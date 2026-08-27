"use client";

import type { ReactNode } from "react";

import { cn } from "@/src/shared/lib/cn";

interface Props {
  title: string;
  subtitle?: string;
  assignedCount?: number;
  assignedLabel?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  badge?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function BranchSummaryModuleCard({
  title,
  subtitle,
  assignedCount,
  assignedLabel = "assigned",
  imageUrl,
  imageAlt,
  badge,
  meta,
  footer,
  className,
}: Props) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {imageUrl !== undefined ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={imageAlt ?? title}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-[#102A56]">
                {title}
              </h3>
              {subtitle ? (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {badge}
          </div>

          {assignedCount !== undefined ? (
            <p className="mt-2 text-xs font-medium text-[#2563EB]">
              {assignedCount} {assignedLabel}
            </p>
          ) : null}
        </div>
      </div>

      {meta ? (
        <div className="mt-3 flex-1 space-y-2 text-sm text-slate-600">
          {meta}
        </div>
      ) : null}

      {footer ? (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {footer}
        </div>
      ) : null}
    </article>
  );
}
