"use client";

import { useMemo, useState } from "react";
import { Building2, MapPinned, Search } from "lucide-react";

import { BranchDiscoveryCard } from "@/src/features/branches/components/branch-discovery-card";
import { useBranches } from "@/src/features/branches/hooks/useBranches";
import {
  filterBranchesBySearch,
  getUniqueBranchCities,
} from "@/src/features/branches/utils/branch-search.utils";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { useDebounce } from "@/src/shared/hooks/use-debounce";
import { cn } from "@/src/shared/lib/cn";

export function BranchesPage() {
  const { branches, isLoading, error, refetch } = useBranches();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const cities = useMemo(
    () => getUniqueBranchCities(branches),
    [branches],
  );

  const filteredBranches = useMemo(() => {
    const seen = new Set<string>();

    return filterBranchesBySearch(branches, debouncedSearch).filter(
      (branch) => {
        if (!branch.id || seen.has(branch.id)) {
          return false;
        }
        seen.add(branch.id);
        return true;
      },
    );
  }, [branches, debouncedSearch]);

  const hasSearch = Boolean(debouncedSearch.trim());

  return (
    <main className="w-full bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FBFF]">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#BFDBFE]/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-[#DDD6FE]/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-[#93C5FD]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
              MCJ Training Institutes
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0B1F3A] sm:text-5xl">
              Our Branches
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Find an MCJ Training Institute branch near you and explore the
              courses, batches, trainers, and learning options available at each
              location.
            </p>

            <div className="mx-auto mt-8 max-w-xl">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search branches..."
                className="h-12 rounded-xl border-slate-200 bg-white pl-10 text-sm shadow-sm focus-visible:ring-[#2563EB]/30"
              />
            </div>

            {!isLoading && !error && branches.length > 0 ? (
              <p className="mt-4 text-xs font-medium text-slate-500">
                {hasSearch
                  ? `${filteredBranches.length} of ${branches.length} branches`
                  : `${branches.length} ${branches.length === 1 ? "branch" : "branches"} available`}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Location-focused intro — real cities only */}
      {!isLoading && !error && cities.length > 0 ? (
        <section className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <div className="mb-2 inline-flex items-center gap-2 text-[#2563EB]">
                  <MapPinned className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Convenient locations
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#0B1F3A] sm:text-[1.75rem]">
                  Learn at a branch that&apos;s convenient for you.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Browse by city using real branch locations from our training
                  centres.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                    !hasSearch
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#2563EB]/30 hover:text-[#2563EB]",
                  )}
                >
                  All locations
                </button>
                {cities.map((city) => {
                  const active =
                    debouncedSearch.trim().toLowerCase() ===
                    city.toLowerCase();

                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSearch(city)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                        active
                          ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#2563EB]/30 hover:text-[#2563EB]",
                      )}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Branch listing */}
      <section className="bg-[#F8FBFF]/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
                Branches
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#0B1F3A] sm:text-3xl">
                Explore our training centres
              </h2>
            </div>
            {!isLoading && !error ? (
              <p className="text-sm text-slate-500">
                Select a branch to view courses, batches, and trainers.
              </p>
            ) : null}
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <Skeleton className="aspect-[16/10] w-full rounded-none" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {error ? (
            <ErrorState
              title="Unable to load branches"
              description="Please try again."
              onRetry={refetch}
            />
          ) : null}

          {!isLoading && !error && branches.length === 0 ? (
            <EmptyState
              title="No branches found"
              description="Try another search or check back later."
            />
          ) : null}

          {!isLoading &&
          !error &&
          branches.length > 0 &&
          filteredBranches.length === 0 ? (
            <EmptyState
              title="No branches found"
              description="Try another search or browse all locations."
              action={
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-4 py-2.5 text-sm font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
                >
                  <Search className="h-4 w-4" />
                  Clear search
                </button>
              }
            />
          ) : null}

          {!isLoading && !error && filteredBranches.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBranches.map((branch) => (
                <BranchDiscoveryCard key={branch.id} branch={branch} />
              ))}
            </div>
          ) : null}

          {!isLoading && !error && filteredBranches.length > 0 ? (
            <div className="mt-12 flex items-start gap-3 rounded-xl border border-[#BFDBFE] bg-white px-4 py-4 sm:px-5">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
              <div>
                <p className="text-sm font-semibold text-[#0B1F3A]">
                  Looking for a specific course or batch?
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Open any branch to explore programmes, timings, trainers, and
                  enrollment options for that location.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
