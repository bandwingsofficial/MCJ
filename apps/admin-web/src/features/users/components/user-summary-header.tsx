"use client";

import Link from "next/link";
import { ChevronRight, X } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { PortalAccountStatus } from "@/src/features/users/services/admin-users.service";

export type UserAccountStatusFilter = "ALL" | PortalAccountStatus;
export type UserReferralFilter = "ALL" | "HAS_REFERRAL" | "NO_REFERRAL";

interface UserSummaryHeaderProps {
  total: number;
  isLoading?: boolean;
  search: string;
  accountStatus: UserAccountStatusFilter;
  referral: UserReferralFilter;
  onSearchChange: (value: string) => void;
  onAccountStatusChange: (value: UserAccountStatusFilter) => void;
  onReferralChange: (value: UserReferralFilter) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function UserSummaryHeader({
  total,
  isLoading = false,
  search,
  accountStatus,
  referral,
  onSearchChange,
  onAccountStatusChange,
  onReferralChange,
  onClearFilters,
  hasActiveFilters,
}: UserSummaryHeaderProps) {
  return (
    <header className="px-1 py-1">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="min-w-0 space-y-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs"
          >
            <Link
              href="/dashboard"
              className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
            >
              Home
            </Link>
            <ChevronRight
              className="h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
            <span aria-current="page" className="font-medium text-[#102A56]">
              User Management
            </span>
          </nav>

          {isLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                User Management
              </h1>
              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Users:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {total}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-full rounded-lg sm:w-[280px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[280px]">
                <SearchInput
                  value={search}
                  placeholder="Search users..."
                  className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                  onChange={onSearchChange}
                />
              </div>

              <div className="w-full sm:w-[140px]">
                <AppSelect
                  value={accountStatus}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={(value) =>
                    onAccountStatusChange(value as UserAccountStatusFilter)
                  }
                  options={[
                    { label: "All Status", value: "ALL" },
                    { label: "Active", value: "ACTIVE" },
                    { label: "Suspended", value: "SUSPENDED" },
                    { label: "Deleted", value: "DELETED" },
                  ]}
                />
              </div>

              <div className="w-full sm:w-[140px]">
                <AppSelect
                  value={referral}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={(value) =>
                    onReferralChange(value as UserReferralFilter)
                  }
                  options={[
                    { label: "All Referrals", value: "ALL" },
                    { label: "With Referral", value: "HAS_REFERRAL" },
                    { label: "No Referral", value: "NO_REFERRAL" },
                  ]}
                />
              </div>

              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-full px-3 text-sm sm:w-auto"
                  onClick={onClearFilters}
                >
                  <X className="mr-1 h-4 w-4" aria-hidden="true" />
                  Clear
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
