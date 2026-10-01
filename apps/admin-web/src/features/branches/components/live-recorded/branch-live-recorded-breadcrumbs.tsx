"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

export function BranchLiveRecordedBreadcrumbs({ items }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-xs"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? (
              <ChevronRight
                className="h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium text-[#647A9B] transition-colors hover:text-[#2563EB]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "font-medium text-[#102A56]"
                    : "font-medium text-slate-700"
                }
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
