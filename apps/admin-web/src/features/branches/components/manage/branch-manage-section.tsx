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

export function BranchManageSection({
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
      <div className="flex flex-col gap-1.5 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#102A56]">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-[#647A9B]">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-3">{children}</div>
    </Card>
  );
}

export function BranchManageEmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
      {Icon ? (
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FBFF] text-[#647A9B] ring-1 ring-[#DCE8F5]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-[#102A56]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#647A9B]">{description}</p>
    </div>
  );
}

export const BRANCH_ICON_BUTTON_CLASS =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

export const BRANCH_ICON_CLASS = "h-[15px] w-[14px] stroke-[2]";
