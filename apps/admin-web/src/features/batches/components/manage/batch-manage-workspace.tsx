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
  BatchSummary,
} from "@/src/features/batches/types/batch.types";

import { BatchManageCoursesPanel } from "./batch-manage-courses-panel";
import { BatchManageOverviewPanel } from "./batch-manage-overview-panel";

interface Props {
  batch: Batch;
  summary: BatchSummary | null;
  summaryLoading?: boolean;
  onTabChange?: (tab: TabKey) => void;
}

export type TabKey = "overview" | "course";

const TABS: { value: TabKey; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "course", label: "Course" },
];

export function BatchManageWorkspace({
  batch,
  summary,
  summaryLoading = false,
  onTabChange,
}: Props) {
  const [tab, setTab] = useState<TabKey>("overview");

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
        {TABS.map(({ value, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <BatchManageOverviewPanel
          batch={batch}
          summary={summary}
          summaryLoading={summaryLoading}
        />
      </TabsContent>

      <TabsContent value="course">
        <BatchManageCoursesPanel batch={batch} />
      </TabsContent>
    </Tabs>
  );
}
