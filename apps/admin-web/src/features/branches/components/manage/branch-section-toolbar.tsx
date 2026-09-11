"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";

import {
  BRANCH_COMPACT_SEARCH_CLASS,
  BRANCH_PRIMARY_BUTTON_CLASS,
} from "./branch-manage-layout.constants";

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
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto lg:w-auto lg:flex-1 lg:justify-end">
      <div className="w-full sm:w-[280px]">
        <SearchInput
          value={search}
          placeholder={searchPlaceholder}
          className={BRANCH_COMPACT_SEARCH_CLASS}
          onChange={onSearchChange}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {createHref && createLabel ? (
          <Link
            href={createHref}
            className={`inline-flex items-center justify-center ${BRANCH_PRIMARY_BUTTON_CLASS}`}
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            {createLabel}
          </Link>
        ) : null}
        {assignLabel && onAssign ? (
          <Button
            type="button"
            disabled={assignDisabled}
            onClick={onAssign}
            className={BRANCH_PRIMARY_BUTTON_CLASS}
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            {assignLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
