"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface ListPageHeaderProps {
  parentLabel: string;
  currentLabel: string;
  title: string;
  totalLabel: string;
  total: number | null;
  action?: ReactNode;
  filters?: ReactNode;
}

export function ListPageHeader({
  parentLabel,
  currentLabel,
  title,
  totalLabel,
  total,
  action,
  filters,
}: ListPageHeaderProps) {
  return (
    <header>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
          <Link
            href="/dashboard"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            {parentLabel}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span aria-current="page" className="font-medium text-[#102A56]">
            {currentLabel}
          </span>
        </nav>
        {action}
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-[30px] font-bold tracking-tight text-[#102A56]">
            {title}
          </h1>
          <span className="text-sm text-[#647A9B]">
            {totalLabel}:
            <span className="ml-1 font-semibold tabular-nums text-[#102A56]">
              {total == null ? "—" : total}
            </span>
          </span>
        </div>
        {filters ? (
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:shrink-0 lg:justify-end">
            {filters}
          </div>
        ) : null}
      </div>
    </header>
  );
}
