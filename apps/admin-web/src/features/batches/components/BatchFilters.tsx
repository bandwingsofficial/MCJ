"use client";

import { useState } from "react";
import { Card } from "@/src/shared/components/ui/card";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";

import {
  BATCH_MODES,
  BATCH_STATUSES,
} from "@/src/features/batches/constants/batch.constants";

import type {
  BatchMode,
  BatchStatus,
} from "@/src/features/batches/types/batch.types";

interface BatchFiltersProps {
  mode?: BatchMode;
  status?: BatchStatus;
  isActive?: boolean;
  includeDeleted: boolean;
  onModeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onActiveChange: (value: string) => void;
  onIncludeDeletedChange: (checked: boolean) => void;
}

const ACTIVE_OPTIONS = [
  {
    label: "All Status Types",
    value: "All",
  },
  {
    label: "Active",
    value: "true",
  },
  {
    label: "Inactive",
    value: "false",
  },
];

export function BatchFilters({
  mode,
  status,
  isActive,
  includeDeleted,
  onModeChange,
  onStatusChange,
  onActiveChange,
  onIncludeDeletedChange,
}: BatchFiltersProps) {
  const [search, setSearch] = useState("");

  return (
    <Card className="p-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search batches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-400"
          />
        </div>

        {/* Mode Dropdown */}
        <div className="w-[160px]">
          <AppSelect
            value={mode ?? ""}
            onValueChange={onModeChange}
            options={[
              {
                label: "All Modes",
                value: "ALL",
              },
              ...BATCH_MODES,
            ]}
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-[160px]">
          <AppSelect
            value={status ?? ""}
            onValueChange={onStatusChange}
            options={[
              {
                label: "All Statuses",
                value: "ALL",
              },
              ...BATCH_STATUSES,
            ]}
          />
        </div>

        {/* Active Dropdown */}
        <div className="w-[160px]">
          <AppSelect
            value={
              isActive === undefined
                ? ""
                : String(isActive)
            }
            onValueChange={onActiveChange}
            options={ACTIVE_OPTIONS}
          />
        </div>

        {/* Checkbox Segment */}
        <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 h-[34px]">
          <Checkbox
            checked={includeDeleted}
            onCheckedChange={(checked) =>
              onIncludeDeletedChange(Boolean(checked))
            }
          />
          <Label className="text-sm select-none whitespace-nowrap">
            Show Deleted
          </Label>
        </div>
      </div>
    </Card>
  );
}