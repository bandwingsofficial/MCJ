"use client";

import type { ReactNode } from "react";

import { Card } from "@/src/shared/components/ui/card";

import type { Branch } from "@/src/features/branches/types/branch.types";
import type { BranchSummaryCounts } from "@/src/features/branches/hooks/use-branch-summary";
import { BranchStatusBadge } from "@/src/features/branches/components/branch-status-badge";
import { BranchOverviewMetricCards } from "@/src/features/branches/components/manage/branch-overview-metric-cards";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import type { BranchManageTabKey } from "@/src/features/branches/components/manage/branch-manage-tab.types";
import { formatBranchAddress } from "@/src/features/branches/utils/branch-display.utils";

interface Props {
  branch: Branch;
  summary: BranchSummaryCounts | null;
  summaryLoading?: boolean;
  assignmentsDisabled?: boolean;
  onNavigateToTab: (tab: BranchManageTabKey) => void;
}

function OverviewField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

const RELATED_MODULES: {
  tab: BranchManageTabKey;
  title: string;
  countKey: keyof Omit<BranchSummaryCounts, "branchId">;
  assignLabel: string;
}[] = [
  {
    tab: "categories",
    title: "Categories",
    countKey: "categories",
    assignLabel: "Assign Category",
  },
  {
    tab: "courses",
    title: "Courses",
    countKey: "courses",
    assignLabel: "Assign Course",
  },
  {
    tab: "batches",
    title: "Batches",
    countKey: "batches",
    assignLabel: "Assign Batch",
  },
  {
    tab: "students",
    title: "Students",
    countKey: "students",
    assignLabel: "Assign Student",
  },
  {
    tab: "trainers",
    title: "Trainers",
    countKey: "instructors",
    assignLabel: "Assign Trainer",
  },
];

export function BranchManageOverviewPanel({
  branch,
  summary,
  summaryLoading = false,
  assignmentsDisabled = false,
  onNavigateToTab,
}: Props) {
  const address = formatBranchAddress(branch);

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Branch Information
        </h2>

        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <OverviewField label="Branch Name" value={branch.branchName} />
          <OverviewField label="Branch Code" value={branch.branchCode} />
          <OverviewField label="Email" value={branch.email ?? ""} />
          <OverviewField label="Phone" value={branch.phone ?? ""} />
          {address ? (
            <div className="sm:col-span-2">
              <OverviewField label="Address" value={address} />
            </div>
          ) : null}
          <OverviewField
            label="Status"
            value={
              <BranchStatusBadge
                status={branch.status}
                deletedAt={branch.deletedAt}
              />
            }
          />
          {branch.description?.trim() ? (
            <div className="sm:col-span-2">
              <OverviewField
                label="Description"
                value={branch.description.trim()}
              />
            </div>
          ) : null}
        </dl>
      </Card>

      <BranchOverviewMetricCards summary={summary} isLoading={summaryLoading} />

      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Related Modules
        </h2>

        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
          {RELATED_MODULES.map((module) => (
            <div
              key={module.tab}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {module.title}
                </p>
                <p className="text-sm text-slate-500">
                  {summaryLoading
                    ? "…"
                    : `${summary?.[module.countKey] ?? 0} assigned`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateToTab(module.tab)}
                  className="text-sm font-medium text-[#2447A8] hover:underline"
                >
                  View all
                </button>
                <Button
                  type="button"
                  size="sm"
                  disabled={assignmentsDisabled}
                  onClick={() => onNavigateToTab(module.tab)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {module.assignLabel}
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Enrollments</p>
              <p className="text-sm text-slate-500">
                {summaryLoading
                  ? "…"
                  : `${summary?.enrollments ?? 0} total`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab("enrollments")}
              className="text-sm font-medium text-[#2447A8] hover:underline"
            >
              View all
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
