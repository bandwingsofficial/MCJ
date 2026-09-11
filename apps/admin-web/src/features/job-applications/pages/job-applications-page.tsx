"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { JobApplicationsWorkspace } from "@/src/features/job-applications/components/JobApplicationsWorkspace";
import { useJobApplications } from "@/src/features/job-applications/hooks/useJobApplications";

export function JobApplicationsPage() {
  const applications = useJobApplications();

  return (
    <div className="space-y-3">
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
                Job Applications
              </span>
            </nav>

            {applications.isInitialLoading ? (
              <Skeleton className="h-8 w-52 rounded-md" />
            ) : (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                  Job Applications
                </h1>
                <span className="text-xs text-[#647A9B] sm:text-[13px]">
                  Total Applications:
                  <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                    {applications.catalogTotal}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="w-full sm:w-[320px] lg:shrink-0">
            {applications.isInitialLoading ? (
              <Skeleton className="h-9 w-full rounded-lg" />
            ) : (
              <SearchInput
                value={applications.filters.search}
                placeholder="Search applications..."
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                onChange={(search) =>
                  applications.setFilters({
                    ...applications.filters,
                    search,
                    page: 1,
                  })
                }
              />
            )}
          </div>
        </div>
      </header>

      <JobApplicationsWorkspace
        applications={applications.jobApplications}
        total={applications.total}
        statusCounts={applications.statusCounts}
        isInitialLoading={applications.isInitialLoading}
        isFetching={applications.isFetching}
        error={applications.error}
        filters={applications.filters}
        setFilters={applications.setFilters}
        refetch={applications.refetch}
      />
    </div>
  );
}

export default JobApplicationsPage;
