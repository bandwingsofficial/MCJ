"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

import { BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import type {
  BatchFilters,
  BatchMode,
} from "@/src/features/batches/types/batch.types";
import {
  applyBatchStatusFilter,
  getBatchStatusFilterValue,
  type BatchStatusFilterValue,
} from "@/src/features/batches/utils/batch-list.utils";
import {
  BATCH_SELECT_ALL,
  uniqueSelectOptions,
} from "@/src/features/batches/utils/batch-select.utils";

interface CategoryOption {
  id: string;
  name: string;
}

interface Props {
  filters: BatchFilters;
  categories: CategoryOption[];
  onChange: (filters: BatchFilters) => void;
}

export function BranchBatchFiltersBar({
  filters,
  categories,
  onChange,
}: Props) {
  const statusFilterValue = getBatchStatusFilterValue(filters);

  const modeOptions = uniqueSelectOptions([
    { label: "All Modes", value: BATCH_SELECT_ALL },
    ...BATCH_MODES,
  ]);

  const categoryOptions = uniqueSelectOptions([
    { label: "All Categories", value: BATCH_SELECT_ALL },
    ...categories.map((category) => ({
      label: category.name,
      value: category.id,
    })),
  ]);

  const statusOptions = uniqueSelectOptions([
    { label: "All Status", value: BATCH_SELECT_ALL },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Archived", value: "ARCHIVED" },
  ]);

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <SearchInput
          value={filters.search ?? ""}
          placeholder="Search batches..."
          className="h-[46px] rounded-xl !py-2 pl-9 text-[15px]"
          onChange={(value) => onChange({ ...filters, search: value })}
        />
      </div>

      <div className="w-full shrink-0 sm:w-44">
        <AppSelect
          value={filters.mode ?? BATCH_SELECT_ALL}
          triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
          onValueChange={(value) =>
            onChange({
              ...filters,
              mode: value === BATCH_SELECT_ALL ? undefined : (value as BatchMode),
            })
          }
          options={modeOptions}
        />
      </div>

      <div className="w-full shrink-0 sm:w-48">
        <AppSelect
          value={filters.categoryId ?? BATCH_SELECT_ALL}
          triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
          onValueChange={(value) =>
            onChange({
              ...filters,
              categoryId: value === BATCH_SELECT_ALL ? undefined : value,
            })
          }
          options={categoryOptions}
        />
      </div>

      <div className="w-full shrink-0 sm:w-44">
        <AppSelect
          value={statusFilterValue}
          triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
          onValueChange={(value) =>
            onChange(
              applyBatchStatusFilter(
                filters,
                value as BatchStatusFilterValue | typeof BATCH_SELECT_ALL,
              ),
            )
          }
          options={statusOptions}
        />
      </div>
    </div>
  );
}
