"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

import {
  STUDENT_STATUS_OPTIONS,
} from "@/src/features/students/constants/student.constants";

import type {
  StudentFilters as StudentFiltersType,
  StudentStatus,
} from "@/src/features/students/types/student.types";

interface Props {
  filters: StudentFiltersType;

  onChange: (
    filters: StudentFiltersType
  ) => void;
}

const ALL_STATUS = "ALL";

export function StudentFilters({
  filters,
  onChange,
}: Props) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        md:flex-row
      "
    >
      <SearchInput
        value={filters.search}
        onChange={(value) =>
          onChange({
            ...filters,
            search: value,
          })
        }
      />

      <AppSelect
        value={filters.status ?? ALL_STATUS}
        options={[
          {
            label: "All Status",
            value: ALL_STATUS,
          },
          ...STUDENT_STATUS_OPTIONS,
        ]}
        onValueChange={(value) =>
          onChange({
            ...filters,
            status:
              value === ALL_STATUS
                ? undefined
                : (value as StudentStatus),
          })
        }
      />
    </div>
  );
}