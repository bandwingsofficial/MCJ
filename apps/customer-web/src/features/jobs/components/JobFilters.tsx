"use client";

import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { cn } from "@/src/shared/lib/cn";

import { EMPLOYMENT_TYPES } from "@/src/features/jobs/constants/job.constants";

import type { EmploymentType } from "@/src/features/jobs/types/job.types";

export interface JobFiltersValue {
  employmentType: EmploymentType | "ALL";
  experienceMin: string;
  experienceMax: string;
  salary: string;
}

interface JobFiltersProps {
  value: JobFiltersValue;
  onChange: (value: JobFiltersValue) => void;
  className?: string;
  showExtendedFilters?: boolean;
}

const SALARY_OPTIONS = [
  { label: "All Salaries", value: "ALL" },
  { label: "Below ₹3 LPA", value: "0-300000" },
  { label: "₹3 - ₹5 LPA", value: "300000-500000" },
  { label: "₹5 - ₹10 LPA", value: "500000-1000000" },
  { label: "Above ₹10 LPA", value: "1000000+" },
];

export function JobFilters({
  value,
  onChange,
  className,
  showExtendedFilters = true,
}: JobFiltersProps) {
  return (
    <div
      className={cn(
        "grid w-full gap-3",
        showExtendedFilters
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      <AppSelect
        value={value.employmentType}
        options={[
          { label: "All Employment Types", value: "ALL" },
          ...EMPLOYMENT_TYPES,
        ]}
        onValueChange={(employmentType) =>
          onChange({
            ...value,
            employmentType: employmentType as EmploymentType | "ALL",
          })
        }
      />

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Input
          type="number"
          min={0}
          placeholder="Min years"
          value={value.experienceMin}
          className="h-10 rounded-xl border-slate-200 bg-[#F8FBFF]"
          onChange={(event) =>
            onChange({
              ...value,
              experienceMin: event.target.value,
            })
          }
        />
        <span className="text-xs font-medium text-slate-400">—</span>
        <Input
          type="number"
          min={0}
          placeholder="Max years"
          value={value.experienceMax}
          className="h-10 rounded-xl border-slate-200 bg-[#F8FBFF]"
          onChange={(event) =>
            onChange({
              ...value,
              experienceMax: event.target.value,
            })
          }
        />
      </div>

      {showExtendedFilters ? (
        <AppSelect
          value={value.salary}
          options={SALARY_OPTIONS}
          onValueChange={(salary) =>
            onChange({
              ...value,
              salary,
            })
          }
        />
      ) : null}
    </div>
  );
}
