"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

interface Props {
  search: string;
  status: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  statusOptions?: { label: string; value: string }[];
  statusLabel?: string;
}

const DEFAULT_STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export function ModuleContentFilters({
  search,
  status,
  searchPlaceholder,
  onSearchChange,
  onStatusChange,
  statusOptions = DEFAULT_STATUS_OPTIONS,
}: Props) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="h-[46px] rounded-xl text-[15px]"
      />
      <div className="sm:w-48">
        <AppSelect
          value={status}
          onValueChange={onStatusChange}
          options={statusOptions}
        />
      </div>
    </div>
  );
}
