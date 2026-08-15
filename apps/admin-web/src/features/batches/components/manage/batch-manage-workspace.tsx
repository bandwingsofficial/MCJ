"use client";

import { useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { Batch, BatchSummary } from "@/src/features/batches/types/batch.types";
import { DAYS_OF_WEEK } from "@/src/features/batches/constants/batch.constants";
import { formatBatchDate } from "@/src/features/batches/utils/batch.helper";
import { formatTrainerNames } from "@/src/features/batches/utils/batch-bulk.utils";

import { BatchManageTrainersPanel } from "./batch-manage-trainers-panel";

interface Props {
  batch: Batch;
  summary: BatchSummary | null;
  summaryLoading?: boolean;
  onSummaryRefresh: () => Promise<void>;
  onBatchUpdated: () => Promise<void>;
  onTabChange?: (tab: TabKey) => void;
}

export type TabKey =
  | "overview"
  | "students"
  | "trainers"
  | "schedule"
  | "attendance"
  | "reports";

function formatDays(days: Batch["daysOfWeek"]) {
  if (!days?.length) {
    return "—";
  }

  const labels = new Map(
    DAYS_OF_WEEK.map((day) => [day.value, day.label]),
  );

  return days.map((day) => labels.get(day) ?? day).join(", ");
}

export function BatchManageWorkspace({
  batch,
  summary,
  summaryLoading = false,
  onSummaryRefresh,
  onBatchUpdated,
  onTabChange,
}: Props) {
  const [tab, setTab] = useState<TabKey>("overview");
  const isArchived = Boolean(batch.deletedAt || batch.isDeleted);

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
            ["students", "Students"],
            ["trainers", "Trainers"],
            ["schedule", "Schedule"],
            ["attendance", "Attendance"],
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Students", summary?.studentsCount ?? 0],
            ["Trainers", summary?.trainerCount ?? batch.trainers.length],
            ["Enrolled", summary?.enrolledCount ?? batch.enrolledCount],
            ["Capacity", summary?.capacity ?? batch.capacity],
          ].map(([label, value]) => (
            <Card
              key={label}
              className="rounded-xl border border-slate-200/80 p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {summaryLoading ? "…" : value}
              </p>
            </Card>
          ))}
        </div>

        <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Batch Information
          </h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Course</dt>
              <dd className="text-sm font-medium text-slate-900">
                {batch.course?.title ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Branch</dt>
              <dd className="text-sm font-medium text-slate-900">
                {batch.branch?.branchName ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Trainers</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatTrainerNames(batch)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Schedule</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatDays(batch.daysOfWeek)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">Description</dt>
              <dd className="text-sm text-slate-800">
                {batch.description?.trim() || "—"}
              </dd>
            </div>
          </dl>
        </Card>
      </TabsContent>

      <TabsContent value="students">
        <Card className="rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <EmptyState
            title="Student management coming soon"
            description="Enrolled students for this batch will appear here."
          />
        </Card>
      </TabsContent>

      <TabsContent value="trainers">
        <BatchManageTrainersPanel
          batch={batch}
          disabled={isArchived}
          onUpdated={async () => {
            await onBatchUpdated();
            await onSummaryRefresh();
          }}
        />
      </TabsContent>

      <TabsContent value="schedule">
        <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Schedule
          </h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Start Date</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatBatchDate(batch.startDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">End Date</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatBatchDate(batch.endDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Time</dt>
              <dd className="text-sm font-medium text-slate-900">
                {batch.startTime} – {batch.endTime}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Days</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatDays(batch.daysOfWeek)}
              </dd>
            </div>
            {batch.classroom ? (
              <div>
                <dt className="text-xs text-slate-500">Classroom</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {batch.classroom}
                </dd>
              </div>
            ) : null}
            {batch.meetingLink ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Meeting Link</dt>
                <dd className="text-sm font-medium text-[#2447A8]">
                  <a
                    href={batch.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {batch.meetingLink}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </Card>
      </TabsContent>

      <TabsContent value="attendance">
        <Card className="rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <EmptyState
            title="Attendance tracking coming soon"
            description={
              summary
                ? `Present: ${summary.attendancePresent} · Absent: ${summary.attendanceAbsent}`
                : "Attendance records will be available here."
            }
          />
        </Card>
      </TabsContent>

      <TabsContent value="reports">
        <Card className="rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <EmptyState
            title="Reports coming soon"
            description="Batch performance reports will be available here."
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
