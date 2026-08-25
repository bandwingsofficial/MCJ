"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

import {
  EnrollmentFilters as Filters,
  EnrollmentStatus,
} from "../../types";

interface EnrollmentFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Pending", value: EnrollmentStatus.PENDING },
  { label: "Pending Approval", value: EnrollmentStatus.PENDING_APPROVAL },
  { label: "Admitted", value: EnrollmentStatus.ADMITTED },
  { label: "Active", value: EnrollmentStatus.ACTIVE },
  { label: "Completed", value: EnrollmentStatus.COMPLETED },
  { label: "Cancelled", value: EnrollmentStatus.CANCELLED },
  { label: "Dropped", value: EnrollmentStatus.DROPPED },
  { label: "Rejected", value: EnrollmentStatus.REJECTED },
];

export function EnrollmentFilters({
  filters,
  onChange,
}: EnrollmentFiltersProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <SearchInput
          value={filters.search ?? ""}
          placeholder="Search enrollments..."
          className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
          onChange={(value: string) =>
            onChange({
              ...filters,
              search: value,
              skip: 0,
            })
          }
        />
      </div>

      <div className="w-full shrink-0 sm:w-48">
        <AppSelect
          value={filters.status ?? "ALL"}
          triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
          onValueChange={(value) =>
            onChange({
              ...filters,
              status:
                value === "ALL" ? undefined : (value as EnrollmentStatus),
              skip: 0,
            })
          }
          options={STATUS_OPTIONS}
        />
      </div>
    </div>
  );
}
