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
  BatchTimingListItem,
} from "@/src/features/branch-ops/types";

import {
  BatchTimingBatchDetailsPanel,
  BatchTimingDetailsPanel,
  BatchTimingOverviewPanel,
  BatchTimingStudentsPanel,
} from "./batch-timing-manage-panels";

export type BatchTimingManageTabKey =
  | "overview"
  | "details"
  | "timing"
  | "students";

export const BATCH_TIMING_MANAGE_TABS: {
  value: BatchTimingManageTabKey;
  label: string;
}[] = [
  { value: "overview", label: "Overview" },
  { value: "details", label: "Batch Details" },
  { value: "timing", label: "Batch Timing" },
  { value: "students", label: "Students" },
];

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

interface Props {
  batch: BatchListItem;
  timing: BatchTimingListItem;
  onTabChange?: (tab: BatchTimingManageTabKey) => void;
}

export function BatchTimingManageWorkspace({
  batch,
  timing,
  onTabChange,
}: Props) {
  const [tab, setTab] = useState<BatchTimingManageTabKey>("overview");

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const nextTab = value as BatchTimingManageTabKey;
        setTab(nextTab);
        onTabChange?.(nextTab);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {BATCH_TIMING_MANAGE_TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className={TAB_CLASS}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <BatchTimingOverviewPanel batch={batch} timing={timing} />
      </TabsContent>

      <TabsContent value="details">
        <BatchTimingBatchDetailsPanel batch={batch} timing={timing} />
      </TabsContent>

      <TabsContent value="timing" className="space-y-4">
        <BatchTimingDetailsPanel timing={timing} />
      </TabsContent>

      <TabsContent value="students">
        <BatchTimingStudentsPanel batchId={batch.id} timingId={timing.id} />
      </TabsContent>
    </Tabs>
  );
}
