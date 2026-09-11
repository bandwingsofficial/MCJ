"use client";

import Link from "next/link";
import { ChevronRight, Copy, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import {
  JOB_LIFECYCLE_STATUS_OPTIONS,
  JOB_ONBOARDING_STATUS_OPTIONS,
} from "@/src/features/jobs/constants/job.constants";
import type {
  JobLifecycleStatus,
  JobOnboardingStatusFilter,
} from "@/src/features/jobs/types/job.types";

export type JobsModuleTab = "jobs" | "onboarding" | "expired";

interface JobSummaryHeaderProps {
  tab: JobsModuleTab;
  onTabChange: (tab: JobsModuleTab) => void;
  total: number;
  pendingOnboardingCount?: number;
  expiredCount?: number;
  isLoading?: boolean;
  onCreate: () => void;
  onCopyOnboardingLink?: () => void;
  createDisabled?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  jobStatus?: JobLifecycleStatus;
  onJobStatusChange: (status: JobLifecycleStatus | undefined) => void;
  onboardingStatus: JobOnboardingStatusFilter;
  onOnboardingStatusChange: (status: JobOnboardingStatusFilter) => void;
}

export function JobSummaryHeader({
  tab,
  onTabChange,
  total,
  pendingOnboardingCount = 0,
  expiredCount = 0,
  isLoading = false,
  onCreate,
  onCopyOnboardingLink,
  createDisabled = false,
  search,
  onSearchChange,
  jobStatus,
  onJobStatusChange,
  onboardingStatus,
  onOnboardingStatusChange,
}: JobSummaryHeaderProps) {
  const isJobs = tab === "jobs";
  const isOnboarding = tab === "onboarding";
  const isExpired = tab === "expired";

  const searchPlaceholder = isJobs
    ? "Search jobs..."
    : isOnboarding
      ? "Search submissions..."
      : "Search expired jobs...";

  return (
    <header className="space-y-2.5 px-1 py-1">
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
              Jobs
            </span>
          </nav>

          {isLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                Jobs
              </h1>
              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Jobs:
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
              {!isJobs && isOnboarding ? (
                <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
              ) : isJobs || isExpired ? (
                <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
              ) : null}
              {isJobs ? (
                <Skeleton className="h-9 w-full rounded-lg sm:w-[150px]" />
              ) : isOnboarding ? (
                <Skeleton className="h-9 w-full rounded-lg sm:w-[180px]" />
              ) : null}
            </>
          ) : (
            <>
              <div
                className={`w-full ${isJobs || isOnboarding || isExpired ? "sm:w-[280px]" : "sm:max-w-xl"}`}
              >
                <SearchInput
                  value={search}
                  placeholder={searchPlaceholder}
                  className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                  onChange={onSearchChange}
                />
              </div>

              {isJobs || isExpired ? (
                <div className="w-full sm:w-[140px]">
                  <AppSelect
                    value={jobStatus ?? "ALL"}
                    triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                    onValueChange={(value) =>
                      onJobStatusChange(
                        value === "ALL"
                          ? undefined
                          : (value as JobLifecycleStatus),
                      )
                    }
                    options={JOB_LIFECYCLE_STATUS_OPTIONS}
                  />
                </div>
              ) : isOnboarding ? (
                <div className="w-full sm:w-[140px]">
                  <AppSelect
                    value={onboardingStatus}
                    triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                    onValueChange={(value) =>
                      onOnboardingStatusChange(
                        value as JobOnboardingStatusFilter,
                      )
                    }
                    options={[...JOB_ONBOARDING_STATUS_OPTIONS]}
                  />
                </div>
              ) : null}

              {isJobs ? (
                <Button
                  type="button"
                  onClick={onCreate}
                  disabled={createDisabled}
                  className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] sm:w-auto"
                  aria-label="Create a new job"
                >
                  <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                  Create Job
                </Button>
              ) : isOnboarding ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCopyOnboardingLink}
                  className="h-9 w-full shrink-0 px-4 text-sm font-semibold sm:w-auto"
                  aria-label="Copy company onboarding link"
                >
                  <Copy className="mr-1 h-4 w-4" aria-hidden="true" />
                  Copy Company Onboarding Link
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => onTabChange(value as JobsModuleTab)}
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger
            value="jobs"
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none"
          >
            Jobs
          </TabsTrigger>
          <TabsTrigger
            value="onboarding"
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none"
          >
            Onboarding
            {pendingOnboardingCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                {pendingOnboardingCount}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="expired"
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none"
          >
            Expired
            {expiredCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                {expiredCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
}
