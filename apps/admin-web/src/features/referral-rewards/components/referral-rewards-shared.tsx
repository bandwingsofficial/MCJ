"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, X } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { Card } from "@/src/shared/components/ui/card";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
export type { ReferralRewardsTab } from "@/src/features/referral-rewards/components/referral-rewards-nav-tabs";
export {
  REFERRAL_REWARDS_TABS,
  ReferralRewardsNavTabs,
} from "@/src/features/referral-rewards/components/referral-rewards-nav-tabs";

export function ReferralRewardsModuleHeader({
  headerAction,
}: {
  headerAction?: ReactNode;
}) {
  return (
    <header className="px-1 py-1">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="min-w-0 space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
            <Link
              href="/dashboard"
              className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <span aria-current="page" className="font-medium text-[#102A56]">
              Referral & Rewards
            </span>
          </nav>

          <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
            Referral & Rewards
          </h1>
        </div>

        {headerAction ? (
          <div className="flex w-full shrink-0 lg:w-auto lg:shrink-0">{headerAction}</div>
        ) : null}
      </div>
    </header>
  );
}

export function ReferralRewardsSectionHeader({
  sectionTitle,
  total,
  totalLabel,
  isLoading,
  search,
  searchPlaceholder = "Search...",
  onSearchChange,
  filters,
  hasActiveFilters,
  onClearFilters,
}: {
  sectionTitle: string;
  total?: number;
  totalLabel?: string;
  isLoading?: boolean;
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 px-1 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 space-y-1">
        {isLoading ? (
          <Skeleton className="h-7 w-48 rounded-md" />
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h2 className="text-lg font-semibold text-[#102A56]">{sectionTitle}</h2>
            {totalLabel != null && total != null ? (
              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                {totalLabel}:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {total}
                </span>
              </span>
            ) : null}
          </div>
        )}
      </div>

      {(onSearchChange || filters) && !isLoading ? (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
          {onSearchChange ? (
            <div className="w-full sm:w-[280px]">
              <SearchInput
                value={search ?? ""}
                placeholder={searchPlaceholder}
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                onChange={onSearchChange}
              />
            </div>
          ) : null}
          {filters}
          {hasActiveFilters && onClearFilters ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full px-3 text-sm sm:w-auto"
              onClick={onClearFilters}
            >
              <X className="mr-1 h-4 w-4" aria-hidden />
              Clear
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ReferralRewardsTableCard({
  isLoading,
  isFetching,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  actionLoading,
  children,
}: {
  isLoading?: boolean;
  isFetching?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  actionLoading?: boolean;
  children: ReactNode;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
      {isLoading ? (
        <SkeletonTable rows={10} />
      ) : (
        <>
          <div aria-busy={isFetching} className="relative">
            {children}
          </div>
          <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
              <span>
                Showing {from}–{to} of {total}
              </span>
              <label className="flex items-center gap-1.5">
                <span className="whitespace-nowrap">Rows per page</span>
                <select
                  className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                  value={pageSize}
                  disabled={actionLoading}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <CategoryPagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </>
      )}
    </Card>
  );
}

export function AdminDataTable({
  columns,
  rows,
  emptyTitle = "No records",
  emptyDescription = "Nothing to show yet.",
}: {
  columns: string[];
  rows: ReactNode[][];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap !px-4 !py-3 text-left text-[11px] font-semibold tracking-wide"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {!rows.length ? (
            <tr>
              <td colSpan={columns.length} className="!px-4 !py-4 align-middle">
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold text-[#102A56]">
                    {emptyTitle}
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    {emptyDescription}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((cells, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
              >
                {cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="!px-4 !py-3 align-middle text-sm text-slate-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function formatReferralDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatReferralDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ReferralUserCell({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  return (
    <div className="min-w-[10rem] max-w-[14rem]">
      <p className="truncate text-sm font-medium text-[#102A56]">
        {name ?? "—"}
      </p>
      {email ? (
        <p className="truncate text-xs text-[#647A9B]">{email}</p>
      ) : (
        <p className="text-xs text-[#647A9B]">—</p>
      )}
    </div>
  );
}
