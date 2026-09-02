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

export type JobsModuleTab = "jobs" | "onboarding" | "applications";

interface JobSummaryHeaderProps {
  tab: JobsModuleTab;
  onTabChange: (tab: JobsModuleTab) => void;
  total: number;
  pendingOnboardingCount?: number;
  pendingApplicationCount?: number;
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
  pendingApplicationCount = 0,
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

  const title =
    isJobs ? "Jobs" : isOnboarding ? "Onboarding" : "Applications";
  const totalLabel =
    isJobs
      ? "Total Jobs:"
      : isOnboarding
        ? "Total Submissions:"
        : "Total Applications:";
  const searchPlaceholder =
    isJobs
      ? "Search jobs..."
      : isOnboarding
        ? "Search submissions..."
        : "Search applications...";

  return (
    <header>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm"
        >
          <Link
            href="/dashboard"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span aria-current="page" className="font-medium text-[#102A56]">
            Jobs
          </span>
        </nav>

        {isJobs ? (
          isLoading ? (
            <Skeleton className="h-[52px] w-full rounded-[14px] sm:w-[190px]" />
          ) : (
            <Button
              type="button"
              onClick={onCreate}
              disabled={createDisabled}
              className="admin-create-btn h-[52px] w-full shrink-0 px-5 font-semibold sm:w-[190px]"
              aria-label="Create a new job"
            >
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Create Job
            </Button>
          )
        ) : isOnboarding ? (
          isLoading ? (
            <Skeleton className="h-[52px] w-full rounded-[14px] sm:w-[280px]" />
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onCopyOnboardingLink}
              className="h-[52px] w-full shrink-0 px-5 font-semibold sm:w-auto"
              aria-label="Copy company onboarding link"
            >
              <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Copy Company Onboarding Link
            </Button>
          )
        ) : null}
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => onTabChange(value as JobsModuleTab)}
      >
        <TabsList className="mt-4 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
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
            value="applications"
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none"
          >
            Applications
            {pendingApplicationCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                {pendingApplicationCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-[30px] font-bold tracking-tight text-[#102A56]">
                {title}
              </h1>
              <span className="text-sm text-[#647A9B]">
                {totalLabel}
                <span className="ml-1 font-semibold tabular-nums text-[#102A56]">
                  {total}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:shrink-0 lg:justify-end">
          {isLoading ? (
            <>
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-[380px]" />
              {!isJobs && isOnboarding ? (
                <Skeleton className="h-[46px] w-full rounded-xl sm:w-[170px]" />
              ) : null}
            </>
          ) : (
            <>
              <div className={`w-full ${isJobs || isOnboarding ? "sm:w-[380px]" : "sm:max-w-xl"}`}>
                <SearchInput
                  value={search}
                  placeholder={searchPlaceholder}
                  className="h-[46px] rounded-xl !py-2 pl-9 text-[15px]"
                  onChange={onSearchChange}
                />
              </div>
              {isJobs ? (
                <div className="w-full sm:w-[170px]">
                  <AppSelect
                    value={jobStatus ?? "ALL"}
                    triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
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
                <div className="w-full sm:w-[170px]">
                  <AppSelect
                    value={onboardingStatus}
                    triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
                    onValueChange={(value) =>
                      onOnboardingStatusChange(
                        value as JobOnboardingStatusFilter,
                      )
                    }
                    options={[...JOB_ONBOARDING_STATUS_OPTIONS]}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
