"use client";

import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import { BRANCH_PRIMARY_BUTTON_CLASS } from "./branch-manage-layout.constants";

interface Props {
  title?: string;
  onViewAll?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  showAction?: boolean;
  actionsOnly?: boolean;
}

export function BranchOverviewSectionHeader({
  title,
  onViewAll,
  actionLabel,
  onAction,
  actionDisabled = false,
  showAction = true,
  actionsOnly = false,
}: Props) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {!actionsOnly && title ? (
        <h3 className="text-base font-semibold text-[#102A56]">{title}</h3>
      ) : (
        <div />
      )}
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8] hover:underline"
          >
            View all
          </button>
        ) : null}
        {showAction && actionLabel && onAction ? (
          <Button
            type="button"
            disabled={actionDisabled}
            onClick={onAction}
            className={BRANCH_PRIMARY_BUTTON_CLASS}
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
