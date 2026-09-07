"use client";

import { useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import { BatchModeDetailsPanel } from "@/src/features/batches/components/mode-manage/batch-mode-details-panel";
import { BatchModeOverviewPanel } from "@/src/features/batches/components/mode-manage/batch-mode-overview-panel";
import { BatchModeTimingsPanel } from "@/src/features/batches/components/mode-manage/batch-mode-timings-panel";

export type BatchModeManageTabKey = "overview" | "details" | "timings";

export const BATCH_MODE_MANAGE_TABS: {
  value: BatchModeManageTabKey;
  label: string;
}[] = [
  { value: "overview", label: "Overview" },
  { value: "details", label: "Batch Details" },
  { value: "timings", label: "Batch Timings" },
];

interface Props {
  batch: Batch;
  mode: BatchMode;
  onTabChange?: (tab: BatchModeManageTabKey) => void;
}

export function BatchModeManageWorkspace({
  batch,
  mode,
  onTabChange,
}: Props) {
  const [tab, setTab] = useState<BatchModeManageTabKey>("overview");

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const nextTab = value as BatchModeManageTabKey;
        setTab(nextTab);
        onTabChange?.(nextTab);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {BATCH_MODE_MANAGE_TABS.map(({ value, label }) => (
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
        <BatchModeOverviewPanel batch={batch} mode={mode} />
      </TabsContent>

      <TabsContent value="details">
        <BatchModeDetailsPanel batch={batch} mode={mode} />
      </TabsContent>

      <TabsContent value="timings">
        <BatchModeTimingsPanel batch={batch} mode={mode} />
      </TabsContent>
    </Tabs>
  );
}
