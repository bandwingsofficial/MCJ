"use client";

import Link from "next/link";

interface Props {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
}

export function SummaryCard({ label, value, hint, href }: Props) {
  const content = (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums leading-none text-[#102A56]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-[11px] text-[#94A3B8]">{hint}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-[#E8EEF5] bg-white px-3.5 py-3 shadow-sm transition-colors hover:border-[#2563EB]/30 hover:bg-[#F8FBFF]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-[#E8EEF5] bg-white px-3.5 py-3 shadow-sm">
      {content}
    </div>
  );
}
