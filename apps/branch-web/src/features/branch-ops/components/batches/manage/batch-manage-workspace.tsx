"use client";

import { useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type {
  BatchListItem,
  BatchSummary,
} from "@/src/features/branch-ops/types";
import type { BatchManageTabKey } from "@/src/features/branch-ops/utils/batch-manage.routes";

import { BatchManageCoursePanel } from "./batch-manage-course-panel";
import { BatchManageDetailsPanel } from "./batch-manage-details-panel";
import { BatchManageOverviewPanel } from "./batch-manage-overview-panel";
import { BatchManageTimingsPanel } from "./batch-manage-timings-panel";
import { BatchManageCalendarPanel } from "./batch-manage-calendar-panel";

export type { BatchManageTabKey };

interface Props {
  batch: BatchListItem;
  summary: BatchSummary | null;
  onTabChange?: (tab: BatchManageTabKey) => void;
}

export const BATCH_MANAGE_TABS: {
  value: BatchManageTabKey;
  label: string;
}[] = [
  { value: "overview", label: "Overview" },
  { value: "course", label: "Course" },
  { value: "details", label: "Batch Details" },
  { value: "timings", label: "Batch Timings" },
  { value: "calendar", label: "Calendar Management" },
];

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

export function BatchManageWorkspace({
  batch,
  summary,
  onTabChange,
}: Props) {
  const [tab, setTab] = useState<BatchManageTabKey>("overview");

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const nextTab = value as BatchManageTabKey;
        setTab(nextTab);
        onTabChange?.(nextTab);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {BATCH_MANAGE_TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className={TAB_CLASS}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <BatchManageOverviewPanel batch={batch} summary={summary} />
      </TabsContent>

      <TabsContent value="course">
        <BatchManageCoursePanel batch={batch} />
      </TabsContent>

      <TabsContent value="details">
        <BatchManageDetailsPanel batch={batch} />
      </TabsContent>

      <TabsContent value="timings">
        <BatchManageTimingsPanel batch={batch} />
      </TabsContent>

      <TabsContent value="calendar">
        <BatchManageCalendarPanel batchId={batch.id} />
      </TabsContent>
    </Tabs>
  );
}
