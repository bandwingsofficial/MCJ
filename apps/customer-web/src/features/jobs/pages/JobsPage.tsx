"use client";

import { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { useDebounce } from "@/src/shared/hooks/use-debounce";

import { JobFilters } from "@/src/features/jobs/components/JobFilters";
import { JobGrid } from "@/src/features/jobs/components/JobGrid";
import { JobSearch } from "@/src/features/jobs/components/JobSearch";

import { useJobs } from "@/src/features/jobs/hooks/useJobs";

import type { EmploymentType } from "@/src/features/jobs/types/job.types";

const PAGE_SIZE = 9;

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.floor(parsed);
}

export function JobsPage() {
  const [search, setSearch] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "ALL">(
    "ALL",
  );
  const [experienceMin, setExperienceMin] = useState("");
  const [experienceMax, setExperienceMax] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const parsedExperienceMin = parseOptionalInt(experienceMin);
  const parsedExperienceMax = parseOptionalInt(experienceMax);

  const jobQuery = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      employmentType:
        employmentType === "ALL" ? undefined : employmentType,
      filterMinExperience: parsedExperienceMin,
      filterMaxExperience: parsedExperienceMax,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    [
      debouncedSearch,
      employmentType,
      parsedExperienceMin,
      parsedExperienceMax,
      page,
    ],
  );

  const { jobs, total, isLoading, error, refetch } = useJobs(jobQuery);

  const hasActiveFilters =
    search.trim().length > 0 ||
    employmentType !== "ALL" ||
    experienceMin.trim().length > 0 ||
    experienceMax.trim().length > 0;

  const clearFilters = () => {
    setSearch("");
    setEmploymentType("ALL");
    setExperienceMin("");
    setExperienceMax("");
    setPage(1);
  };

  const resultLabel = isLoading
    ? null
    : `${total} ${total === 1 ? "opportunity" : "opportunities"}`;

  return (
    <main className="m-0 w-full p-0">
      <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FBFF]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#EFF6FF] to-transparent" />
        <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[#E0E7FF]/45 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-[#EDE9FE]/35 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
              <Briefcase className="h-3.5 w-3.5" />
              Jobs
            </p>
            <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
              Career Opportunities
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Find your next opportunity with us.
            </p>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_28px_rgba(11,31,58,0.06)] sm:p-5">
            <JobSearch
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />

            <JobFilters
              showExtendedFilters={false}
              value={{
                employmentType,
                experienceMin,
                experienceMax,
                salary: "ALL",
              }}
              onChange={(value) => {
                setEmploymentType(value.employmentType);
                setExperienceMin(value.experienceMin);
                setExperienceMax(value.experienceMax);
                setPage(1);
              }}
            />

            {hasActiveFilters ? (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
                Open roles
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0B1F3A] sm:text-2xl">
                Available positions
              </h2>
            </div>
            {resultLabel ? (
              <p className="text-sm font-medium text-slate-500">{resultLabel}</p>
            ) : null}
          </div>

          <JobGrid
            jobs={jobs}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
          />
        </div>
      </section>
    </main>
  );
}
