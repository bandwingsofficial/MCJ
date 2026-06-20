"use client";

import { AppSelect } from "@/src/shared/components/ui/select";

import {
  EMPLOYMENT_TYPES,
} from "@/src/features/jobs/constants/job.constants";

import type {
  EmploymentType,
} from "@/src/features/jobs/types/job.types";

export interface JobFiltersValue {
  employmentType:
    | EmploymentType
    | "ALL";

  experience: string;

  salary: string;
}

interface JobFiltersProps {
  value: JobFiltersValue;

  onChange: (
    value: JobFiltersValue,
  ) => void;
}

const EXPERIENCE_OPTIONS = [
  {
    label: "All Experience",
    value: "ALL",
  },
  {
    label: "0 - 1 Years",
    value: "0-1",
  },
  {
    label: "1 - 3 Years",
    value: "1-3",
  },
  {
    label: "3 - 5 Years",
    value: "3-5",
  },
  {
    label: "5+ Years",
    value: "5+",
  },
];

const SALARY_OPTIONS = [
  {
    label: "All Salaries",
    value: "ALL",
  },
  {
    label: "Below ₹3 LPA",
    value: "0-300000",
  },
  {
    label: "₹3 - ₹5 LPA",
    value: "300000-500000",
  },
  {
    label: "₹5 - ₹10 LPA",
    value: "500000-1000000",
  },
  {
    label: "Above ₹10 LPA",
    value: "1000000+",
  },
];

export function JobFilters({
  value,
  onChange,
}: JobFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
      <AppSelect
        value={value.employmentType}
        options={[
          {
            label:
              "All Employment Types",
            value: "ALL",
          },
          ...EMPLOYMENT_TYPES,
        ]}
        onValueChange={(
          employmentType,
        ) =>
          onChange({
            ...value,
            employmentType:
              employmentType as
                | EmploymentType
                | "ALL",
          })
        }
      />

      <AppSelect
        value={value.experience}
        options={
          EXPERIENCE_OPTIONS
        }
        onValueChange={(
          experience,
        ) =>
          onChange({
            ...value,
            experience,
          })
        }
      />

      <AppSelect
        value={value.salary}
        options={SALARY_OPTIONS}
        onValueChange={(
          salary,
        ) =>
          onChange({
            ...value,
            salary,
          })
        }
      />
    </div>
  );
}