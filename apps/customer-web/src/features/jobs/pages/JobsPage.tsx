"use client";

import { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";

import { JobFilters } from "@/src/features/jobs/components/JobFilters";
import { JobGrid } from "@/src/features/jobs/components/JobGrid";
import { JobSearch } from "@/src/features/jobs/components/JobSearch";

import { useJobs } from "@/src/features/jobs/hooks/useJobs";

import type { EmploymentType } from "@/src/features/jobs/types/job.types";

export function JobsPage() {
  const { jobs, isLoading, error, refetch } = useJobs();

  const [search, setSearch] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "ALL">(
    "ALL",
  );
  const [experience, setExperience] = useState("ALL");
  const [salary, setSalary] = useState("ALL");
  const [page, setPage] = useState(1);

  const pageSize = 9;

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.companyName.toLowerCase().includes(search.toLowerCase());

      const matchesEmployment =
        employmentType === "ALL" || job.employmentType === employmentType;

      const matchesExperience =
        experience === "ALL" ||
        (() => {
          const min = job.minExperience ?? 0;

          switch (experience) {
            case "0-1":
              return min <= 1;
            case "1-3":
              return min >= 1 && min <= 3;
            case "3-5":
              return min >= 3 && min <= 5;
            case "5+":
              return min >= 5;
            default:
              return true;
          }
        })();

      const matchesSalary =
        salary === "ALL" ||
        (() => {
          const minSalary = job.minSalary ?? 0;

          switch (salary) {
            case "0-300000":
              return minSalary <= 300000;
            case "300000-500000":
              return minSalary >= 300000 && minSalary <= 500000;
            case "500000-1000000":
              return minSalary >= 500000 && minSalary <= 1000000;
            case "1000000+":
              return minSalary >= 1000000;
            default:
              return true;
          }
        })();

      return (
        matchesSearch &&
        matchesEmployment &&
        matchesExperience &&
        matchesSalary
      );
    });
  }, [jobs, search, employmentType, experience, salary]);

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, page]);

  const resultLabel = isLoading
    ? null
    : `${filteredJobs.length} ${filteredJobs.length === 1 ? "opportunity" : "opportunities"}`;

  return (
    <main className="m-0 w-full p-0">
      {/* Compact career hero — distinct from About two-column image hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FBFF]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#EFF6FF] to-transparent" />
        <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[#E0E7FF]/45 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-[#EDE9FE]/35 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
              <Briefcase className="h-3.5 w-3.5" />
              Job Applications
            </p>
            <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
              Career Opportunities
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Find your next opportunity with us.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_28px_rgba(11,31,58,0.06)] sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="w-full lg:flex-1">
                <JobSearch
                  value={search}
                  onChange={(value) => {
                    setSearch(value);
                    setPage(1);
                  }}
                />
              </div>

              <JobFilters
                showExtendedFilters={false}
                className="lg:w-72"
                value={{
                  employmentType,
                  experience,
                  salary,
                }}
                onChange={(value) => {
                  setEmploymentType(value.employmentType);
                  setExperience(value.experience);
                  setSalary(value.salary);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Listing */}
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
            jobs={paginatedJobs}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
          />
        </div>
      </section>
    </main>
  );
}
