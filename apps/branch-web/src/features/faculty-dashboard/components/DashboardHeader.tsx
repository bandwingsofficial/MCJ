"use client";

import { RefreshCw } from "lucide-react";

import { RoleBadge } from "@/src/shared/components/ui/role-badge";
import { Button } from "@/src/shared/components/ui/button";

import { formatDashboardTimestamp } from "../utils/dashboard-date.utils";

interface Props {
  lastUpdated?: string;
  refreshing?: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({
  lastUpdated,
  refreshing,
  onRefresh,
}: Props) {
  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#102A56] sm:text-2xl">
          Faculty Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-[#647A9B]">
          Teaching operations for your assigned batches.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RoleBadge role="FACULTY" />
          <span className="text-xs text-[#647A9B]">
            Last updated: {formatDashboardTimestamp(lastUpdated)}
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 shrink-0 rounded-lg"
        disabled={refreshing}
        onClick={onRefresh}
      >
        <RefreshCw
          className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>
    </header>
  );
}
