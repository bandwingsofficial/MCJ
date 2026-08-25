"use client";

import { useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type {
  Batch,
  BatchCourseAssignment,
  BatchSummary,
} from "@/src/features/batches/types/batch.types";

import { BatchManageCoursesPanel } from "./batch-manage-courses-panel";
import { BatchManageOverviewPanel } from "./batch-manage-overview-panel";
import { BatchManageStudentsPanel } from "./batch-manage-students-panel";

interface Props {
  batch: Batch;
  summary: BatchSummary | null;
  summaryLoading?: boolean;
  assignments: BatchCourseAssignment[];
  assignmentsLoading?: boolean;
  onAssignmentsChange: (assignments: BatchCourseAssignment[]) => void;
  onSummaryRefresh: () => Promise<void>;
  onBatchUpdated: () => Promise<void>;
  onAssignmentsRefresh: () => Promise<void>;
  onTabChange?: (tab: TabKey) => void;
}

export type TabKey = "overview" | "courses" | "students";

export function BatchManageWorkspace({
  batch,
  summary,
  summaryLoading = false,
  assignments,
  assignmentsLoading = false,
  onAssignmentsChange,
  onSummaryRefresh,
  onBatchUpdated,
  onAssignmentsRefresh,
  onTabChange,
}: Props) {
  const [tab, setTab] = useState<TabKey>("overview");
  const isArchived = Boolean(batch.deletedAt || batch.isDeleted);

  const handleUpdated = async () => {
    await onBatchUpdated();
    await onSummaryRefresh();
    await onAssignmentsRefresh();
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
            ["courses", "Courses"],
            ["students", "Students"],
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
        <BatchManageOverviewPanel
          batch={batch}
          assignments={assignments}
          assignmentsLoading={assignmentsLoading}
        />
      </TabsContent>

      <TabsContent value="courses">
        <BatchManageCoursesPanel
          batch={batch}
          disabled={isArchived}
          assignments={assignments}
          assignmentsLoading={assignmentsLoading}
          onAssignmentsChange={onAssignmentsChange}
          onUpdated={handleUpdated}
        />
      </TabsContent>

      <TabsContent value="students">
        <BatchManageStudentsPanel
          batch={batch}
          disabled={isArchived}
          onUpdated={handleUpdated}
        />
      </TabsContent>
    </Tabs>
  );
}
