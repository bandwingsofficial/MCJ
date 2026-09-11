"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Clock3,
  FileText,
  LayoutDashboard,
} from "lucide-react";

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
import { BatchManageCalendarPanel } from "./batch-manage-calendar-panel";

interface Props {
  batch: Batch;
  summary: BatchSummary | null;
  summaryLoading?: boolean;
  onTabChange?: (tab: BatchManageTabKey) => void;
  onEditBatch: () => void;
  editDisabled?: boolean;
}

export type BatchManageTabKey = "overview" | "details" | "timings" | "calendar";

const TAB_CLASS =
  "inline-flex items-center rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

export const BATCH_MANAGE_TABS: {
  value: BatchManageTabKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "details", label: "Batch Details", icon: FileText },
  { value: "timings", label: "Batch Timings", icon: Clock3 },
  { value: "calendar", label: "Calendar Management", icon: CalendarDays },
];

export function BatchManageWorkspace({
  batch,
  summary,
  summaryLoading = false,
  onTabChange,
  onEditBatch,
  editDisabled = false,
}: Props) {
  return (
    <Tabs
      defaultValue="overview"
      onValueChange={(value) => {
        onTabChange?.(value as BatchManageTabKey);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {BATCH_MANAGE_TABS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className={TAB_CLASS}>
            <Icon className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
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

      <TabsContent value="calendar">
        <BatchManageCalendarPanel batchId={batch.id} />
      </TabsContent>
    </Tabs>
  );
}
