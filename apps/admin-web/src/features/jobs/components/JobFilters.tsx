"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";

import { Switch } from "@/src/shared/components/ui/switch";

import { Label } from "@/src/shared/components/ui/label";

import {
  AppSelect,
} from "@/src/shared/components/ui/select";

import {
  EMPLOYMENT_TYPES,
  JOB_STATUS_OPTIONS,
} from "@/src/features/jobs/constants/job.constants";

import type {
  EmploymentType,
  JobStatus,
} from "@/src/features/jobs/types/job.types";

interface JobFiltersValue {
  search: string;

  includeDeleted: boolean;

  status: JobStatus | "";

  employmentType:
    | EmploymentType
    | "";
}

interface JobFiltersProps {
  value: JobFiltersValue;

  onChange: (
    value: JobFiltersValue,
  ) => void;
}

export function JobFilters({
  value,
  onChange,
}: JobFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <SearchInput
        value={value.search}
        onChange={(search) =>
          onChange({
            ...value,
            search,
          })
        }
      />

      <AppSelect
        value={
          value.status || undefined
        }
        onValueChange={(
          status,
        ) =>
          onChange({
            ...value,
            status:
              status === "ALL"
                ? ""
                : (status as JobStatus),
          })
        }
        options={[
          {
            label:
              "All Status",
            value: "ALL",
          },
          ...JOB_STATUS_OPTIONS,
        ]}
      />

      <AppSelect
        value={
          value.employmentType ||
          undefined
        }
        onValueChange={(
          employmentType,
        ) =>
          onChange({
            ...value,
            employmentType:
              employmentType ===
              "ALL"
                ? ""
                : (employmentType as EmploymentType),
          })
        }
        options={[
          {
            label:
              "All Types",
            value: "ALL",
          },
          ...EMPLOYMENT_TYPES,
        ]}
      />

      <div className="flex items-center gap-3">
        <Switch
          checked={
            value.includeDeleted
          }
          onCheckedChange={(
            checked,
          ) =>
            onChange({
              ...value,
              includeDeleted:
                checked,
            })
          }
        />

        <Label>
          Include Deleted
        </Label>
      </div>
    </div>
  );
}