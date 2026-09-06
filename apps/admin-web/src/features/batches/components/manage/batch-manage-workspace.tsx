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

import { BatchManageDetailsPanel } from "./batch-manage-details-panel";
import { BatchManageOverviewPanel } from "./batch-manage-overview-panel";
import { BatchManageTimingsPanel } from "./batch-manage-timings-panel";

interface Props {
  batch: Batch;
  summary: BatchSummary | null;
  summaryLoading?: boolean;
  onTabChange?: (tab: BatchManageTabKey) => void;
  onEditBatch: () => void;
  editDisabled?: boolean;
}

export type BatchManageTabKey = "overview" | "details" | "timings";

export const BATCH_MANAGE_TABS: {
  value: BatchManageTabKey;
  label: string;
}[] = [
  { value: "overview", label: "Overview" },
  { value: "details", label: "Batch Details" },
  { value: "timings", label: "Batch Timings" },
];

export function BatchManageWorkspace({
  batch,
  summary,
  summaryLoading = false,
  onTabChange,
  onEditBatch,
  editDisabled = false,
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

      <TabsContent value="details">
        <BatchManageDetailsPanel
          batch={batch}
          onEdit={onEditBatch}
          editDisabled={editDisabled}
        />
      </TabsContent>

      <TabsContent value="timings">
        <BatchManageTimingsPanel batch={batch} />
      </TabsContent>
    </Tabs>
  );
}
