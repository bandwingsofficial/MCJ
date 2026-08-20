"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  assignLabel?: string;
  onAssign?: () => void;
  assignDisabled?: boolean;
  createHref?: string;
  createLabel?: string;
}

export function BranchSectionToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  assignLabel,
  onAssign,
  assignDisabled = false,
  createHref,
  createLabel,
}: Props) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 sm:max-w-sm">
        <SearchInput
          value={search}
          placeholder={searchPlaceholder}
          onChange={onSearchChange}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {createHref && createLabel ? (
          <Link
            href={createHref}
            className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {createLabel}
          </Link>
        ) : null}
        {assignLabel && onAssign ? (
          <Button
            type="button"
            size="sm"
            disabled={assignDisabled}
            onClick={onAssign}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {assignLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
