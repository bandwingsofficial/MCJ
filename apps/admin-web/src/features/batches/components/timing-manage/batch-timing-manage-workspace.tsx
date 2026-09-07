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
  BatchTiming,
} from "@/src/features/batches/types/batch.types";

import { BatchTimingAttendancePanel } from "./batch-timing-attendance-panel";
import { BatchTimingBatchDetailsPanel } from "./batch-timing-batch-details-panel";
import { BatchTimingDetailsPanel } from "./batch-timing-details-panel";
import { BatchTimingCapacityForm } from "./batch-timing-capacity-form";
import { BatchTimingOverviewPanel } from "./batch-timing-overview-panel";
import { BatchTimingReportsPanel } from "./batch-timing-reports-panel";
import { BatchTimingStudentsPanel } from "./batch-timing-students-panel";

interface Props {
  batch: Batch;
  timing: BatchTiming;
  onTabChange?: (tab: BatchTimingManageTabKey) => void;
  onTimingUpdated?: () => void;
}

export type BatchTimingManageTabKey =
  | "overview"
  | "details"
  | "timing"
  | "students"
  | "attendance"
  | "reports";

export const BATCH_TIMING_MANAGE_TABS: {
  value: BatchTimingManageTabKey;
  label: string;
}[] = [
  { value: "overview", label: "Overview" },
  { value: "details", label: "Batch Details" },
  { value: "timing", label: "Batch Timing" },
  { value: "students", label: "Students" },
  { value: "attendance", label: "Attendance" },
  { value: "reports", label: "Reports" },
];

export function BatchTimingManageWorkspace({
  batch,
  timing,
  onTabChange,
  onTimingUpdated,
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
        <BatchTimingOverviewPanel batch={batch} timing={timing} />
      </TabsContent>

      <TabsContent value="details">
        <BatchTimingBatchDetailsPanel batch={batch} />
      </TabsContent>

      <TabsContent value="timing" className="space-y-4">
        <BatchTimingDetailsPanel timing={timing} />
        <BatchTimingCapacityForm
          batchId={batch.id}
          timing={timing}
          onUpdated={() => onTimingUpdated?.()}
        />
      </TabsContent>

      <TabsContent value="students">
        <BatchTimingStudentsPanel timing={timing} />
      </TabsContent>

      <TabsContent value="attendance">
        <BatchTimingAttendancePanel timing={timing} />
      </TabsContent>

      <TabsContent value="reports">
        <BatchTimingReportsPanel timing={timing} />
      </TabsContent>
    </Tabs>
  );
}
