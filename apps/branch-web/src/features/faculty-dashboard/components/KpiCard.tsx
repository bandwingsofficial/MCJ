"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { DASHBOARD_CARD, DASHBOARD_COLORS } from "../constants";

interface Props {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  icon: LucideIcon;
  accent?: string;
}

export function KpiCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  accent = DASHBOARD_COLORS.primary,
}: Props) {
  const content = (
    <div className="flex items-start gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}14`, color: accent }}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
          {label}
        </p>
        <p className="mt-0.5 text-xl font-bold tabular-nums leading-none text-[#102A56]">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 truncate text-[11px] text-[#94A3B8]">{hint}</p>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block ${DASHBOARD_CARD} px-3 py-2.5 transition-colors hover:border-[#2563EB]/25 hover:bg-[#F8FBFF]`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`${DASHBOARD_CARD} px-3 py-2.5`}>{content}</div>
  );
}
