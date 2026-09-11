"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/src/shared/components/ui/page-header";

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

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, page]);

  return (
    <div className="container mx-auto space-y-6 px-4 py-10 md:px-6">
      <PageHeader
        title="Career Opportunities"
        description="Find your next opportunity with us."
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
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

      <JobGrid
        jobs={paginatedJobs}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
}
