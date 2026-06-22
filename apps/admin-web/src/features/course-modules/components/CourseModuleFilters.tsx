"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Switch } from "@/src/shared/components/ui/switch";
import { Label } from "@/src/shared/components/ui/label";

interface CourseModuleFiltersProps {
  search: string;

  includeDeleted: boolean;

  onSearchChange: (
    value: string
  ) => void;

  onIncludeDeletedChange: (
    value: boolean
  ) => void;
}

export function CourseModuleFilters({
  search,
  includeDeleted,
  onSearchChange,
  onIncludeDeletedChange,
}: CourseModuleFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:max-w-md">
        <SearchInput
          value={search}
          onChange={
            onSearchChange
          }
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={
            includeDeleted
          }
          onCheckedChange={
            onIncludeDeletedChange
          }
        />

        <Label>
          Include Deleted
        </Label>
      </div>
    </div>
  );
}