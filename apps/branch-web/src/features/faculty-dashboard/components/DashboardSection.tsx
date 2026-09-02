"use client";

import type { ReactNode } from "react";

import { DASHBOARD_CARD } from "../constants";

interface Props {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  viewAllHref,
  children,
  className = "",
}: Props) {
  return (
    <section className={`${DASHBOARD_CARD} rounded-2xl p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#102A56]">{title}</h2>
        {viewAllHref ? (
          <a
            href={viewAllHref}
            className="shrink-0 text-[11px] font-medium text-[#2563EB] hover:underline"
          >
            View All →
          </a>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function DashboardEmptyState({ message }: { message: string }) {
  return (
    <p className="py-5 text-center text-sm text-[#647A9B]">{message}</p>
  );
}

export function DashboardSectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="py-5 text-center">
      <p className="text-sm text-[#647A9B]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-[#2563EB] hover:underline"
          onClick={onRetry}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
