"use client";

import { useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { Branch } from "@/src/features/branches/types/branch.types";
import type { BranchSummaryCounts } from "@/src/features/branches/hooks/use-branch-summary";

import { BranchManageBatchesPanel } from "./branch-manage-batches-panel";
import { BranchManageCategoriesPanel } from "./branch-manage-categories-panel";
import { BranchManageCoursesPanel } from "./branch-manage-courses-panel";
import { BranchManageEnrollmentsPanel } from "./branch-manage-enrollments-panel";
import { BranchManageUsersPanel } from "./branch-manage-users-panel";
import { BranchManageOverviewPanel } from "./branch-manage-overview-panel";
import type { BranchManageTabKey } from "./branch-manage-tab.types";

interface Props {
  branch: Branch;
  summary: BranchSummaryCounts | null;
  summaryLoading?: boolean;
  onSummaryRefresh: () => Promise<void>;
  onTabChange?: (tab: BranchManageTabKey) => void;
}

type TabKey = BranchManageTabKey;

export function BranchManageWorkspace({
  branch,
  summary,
  summaryLoading = false,
  onSummaryRefresh,
  onTabChange,
}: Props) {
  const branchId = branch.id;
  const isArchived = Boolean(branch.deletedAt);
  const assignmentsDisabled = isArchived || branch.status !== "ACTIVE";
  const [tab, setTab] = useState<TabKey>("overview");
  const [assignOnMountTab, setAssignOnMountTab] = useState<TabKey | null>(
    null,
  );

  const navigateToTab = (
    nextTab: TabKey,
    options?: { assign?: boolean },
  ) => {
    setTab(nextTab);
    onTabChange?.(nextTab);

    if (options?.assign) {
      setAssignOnMountTab(nextTab);
    }
  };

  const clearAssignOnMount = (currentTab: TabKey) => {
    setAssignOnMountTab((previous) =>
      previous === currentTab ? null : previous,
    );
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const nextTab = value as TabKey;
        setTab(nextTab);
        onTabChange?.(nextTab);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {(
          [
            ["overview", "Overview"],
            ["users", "Users"],
            ["batches", "Batches"],
            ["categories", "Categories"],
            ["courses", "Courses"],
            ["students", "Enrolled Students"],
            ["reports", "Reports"],
          ] as const
        ).map(([value, label]) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2447A8] data-[state=active]:bg-transparent data-[state=active]:text-[#2447A8] data-[state=active]:shadow-none"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <BranchManageOverviewPanel
          branch={branch}
          summary={summary}
          summaryLoading={summaryLoading}
          assignmentsDisabled={assignmentsDisabled}
          onNavigateToTab={navigateToTab}
        />
      </TabsContent>

      <TabsContent value="users" className="space-y-3">
        <BranchManageUsersPanel
          branchId={branchId}
          branchName={branch.branchName}
          branchCode={branch.branchCode}
          disabled={assignmentsDisabled}
        />
      </TabsContent>

      <TabsContent value="categories">
        <BranchManageCategoriesPanel
          branchId={branchId}
          assignmentsDisabled={assignmentsDisabled}
          assignOnMount={assignOnMountTab === "categories"}
          onAssignOnMountHandled={() => clearAssignOnMount("categories")}
          onSummaryRefresh={onSummaryRefresh}
        />
      </TabsContent>

      <TabsContent value="courses">
        <BranchManageCoursesPanel
          branchId={branchId}
          assignmentsDisabled={assignmentsDisabled}
          assignOnMount={assignOnMountTab === "courses"}
          onAssignOnMountHandled={() => clearAssignOnMount("courses")}
          onSummaryRefresh={onSummaryRefresh}
        />
      </TabsContent>

      <TabsContent value="batches">
        <BranchManageBatchesPanel
          branchId={branchId}
          assignmentsDisabled={assignmentsDisabled}
          assignOnMount={assignOnMountTab === "batches"}
          onAssignOnMountHandled={() => clearAssignOnMount("batches")}
          onSummaryRefresh={onSummaryRefresh}
        />
      </TabsContent>

      <TabsContent value="students">
        <BranchManageEnrollmentsPanel branchId={branchId} />
      </TabsContent>

      <TabsContent value="reports">
        <Card className="rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-700">
            Reports coming soon
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Branch-level reporting will be available in a future update.
          </p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
