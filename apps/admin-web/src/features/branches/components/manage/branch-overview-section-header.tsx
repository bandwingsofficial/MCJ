"use client";

import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

interface Props {
  title: string;
  onViewAll?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  showAction?: boolean;
}

export function BranchOverviewSectionHeader({
  title,
  onViewAll,
  actionLabel,
  onAction,
  actionDisabled = false,
  showAction = true,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-base font-semibold text-[#102A56]">{title}</h2>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            View all
          </button>
        ) : null}
        {showAction && actionLabel && onAction ? (
          <Button
            type="button"
            size="sm"
            disabled={actionDisabled}
            onClick={onAction}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
