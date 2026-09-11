"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Layers,
  Tag,
  UserCheck,
  Users,
} from "lucide-react";

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
import { BranchManageEmptyState } from "./branch-manage-section";
import type { BranchManageTabKey } from "./branch-manage-tab.types";

interface Props {
  branch: Branch;
  summary: BranchSummaryCounts | null;
  summaryLoading?: boolean;
  onSummaryRefresh: () => Promise<void>;
  onTabChange?: (tab: BranchManageTabKey) => void;
}

const TAB_CLASS =
  "inline-flex items-center rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const TAB_ITEMS: ReadonlyArray<{
  value: BranchManageTabKey;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "users", label: "Users", icon: Users },
  { value: "batches", label: "Batches", icon: Layers },
  { value: "categories", label: "Categories", icon: Tag },
  { value: "courses", label: "Courses", icon: BookOpen },
  { value: "students", label: "Enrolled Students", icon: UserCheck },
  { value: "reports", label: "Reports", icon: BarChart3 },
];

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
  const [tab, setTab] = useState<BranchManageTabKey>("overview");
  const [assignOnMountTab, setAssignOnMountTab] = useState<BranchManageTabKey | null>(
    null,
  );

  const navigateToTab = (
    nextTab: BranchManageTabKey,
    options?: { assign?: boolean },
  ) => {
    setTab(nextTab);
    onTabChange?.(nextTab);

    if (options?.assign) {
      setAssignOnMountTab(nextTab);
    }
  };

  const clearAssignOnMount = (currentTab: BranchManageTabKey) => {
    setAssignOnMountTab((previous) =>
      previous === currentTab ? null : previous,
    );
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const nextTab = value as BranchManageTabKey;
        setTab(nextTab);
        onTabChange?.(nextTab);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className={TAB_CLASS}>
            <Icon className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">
        <BranchManageOverviewPanel
          branch={branch}
          summary={summary}
          summaryLoading={summaryLoading}
          assignmentsDisabled={assignmentsDisabled}
          onNavigateToTab={navigateToTab}
        />
      </TabsContent>

      <TabsContent value="users">
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
        <BranchManageEnrollmentsPanel
          branchId={branchId}
          disabled={assignmentsDisabled}
        />
      </TabsContent>

      <TabsContent value="reports">
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-3 shadow-sm">
          <BranchManageEmptyState
          icon={BarChart3}
          title="Reports Coming Soon"
          description="Branch-level reporting will be available in a future update."
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
