"use client";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";

interface BatchToolbarProps {
  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  onCreate: () => void;
}

export function BatchToolbar({
  search,
  onSearchChange,
  onCreate,
}: BatchToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <SearchInput
        value={search}
        onChange={
          onSearchChange
        }
      />

      <Button
        onClick={onCreate}
      >
        Add Batch
      </Button>
    </div>
  );
}