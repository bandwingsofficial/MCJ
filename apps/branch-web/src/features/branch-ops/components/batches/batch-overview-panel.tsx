"use client";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  formatBatchDate,
  formatBatchMode,
  formatBatchStatus,
  formatBatchTiming,
  formatWorkingDays,
} from "@/src/features/branch-ops/utils/batch-display";
import { Card } from "@/src/shared/components/ui/card";

interface Props {
  batch: BatchListItem;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-[#E1EBF5] p-0 shadow-[0_2px_10px_rgba(16,42,86,0.04)]">
      <div className="border-b border-[#E1EBF5] px-5 py-3">
        <h2 className="text-sm font-semibold text-[#102A56]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[#647A9B]">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-[#102A56]">
        {value}
      </dd>
    </div>
  );
}

export function BatchOverviewPanel({ batch }: Props) {
  const trainer =
    batch.trainers?.map((item) => item.name).filter(Boolean).join(", ") || "—";
  const branch = batch.branch;
  const branchLocation = [branch?.addressLine1, branch?.city, branch?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section title="Basic details">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Batch name" value={batch.name} />
          <Field label="Batch code" value={batch.code} />
          <Field label="Course" value={batch.course?.title ?? "—"} />
          <Field label="Trainer" value={trainer} />
          <Field label="Mode" value={formatBatchMode(batch.mode)} />
          <Field label="Status" value={formatBatchStatus(batch.status)} />
        </dl>
      </Section>

      <Section title="Schedule">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" value={formatBatchDate(batch.startDate)} />
          <Field label="End date" value={formatBatchDate(batch.endDate)} />
          <Field
            label="Working days"
            value={formatWorkingDays(batch.daysOfWeek)}
          />
          <Field
            label="Start time"
            value={formatBatchTiming(batch.startTime, null)}
          />
          <Field
            label="End time"
            value={formatBatchTiming(null, batch.endTime)}
          />
          <Field
            label="Batch duration"
            value={
              batch.durationDays != null
                ? `${batch.durationDays} day${batch.durationDays === 1 ? "" : "s"}`
                : "—"
            }
          />
          <Field
            label="Total working days"
            value={
              batch.totalWorkingDays != null
                ? String(batch.totalWorkingDays)
                : "—"
            }
          />
        </dl>
      </Section>

      <Section title="Capacity">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Maximum seats"
            value={batch.capacity == null ? "—" : String(batch.capacity)}
          />
          <Field
            label="Enrolled students"
            value={String(batch.enrolledStudents)}
          />
          <Field
            label="Available seats"
            value={
              batch.availableSeats == null ? "—" : String(batch.availableSeats)
            }
          />
        </dl>
      </Section>

      <Section title="Branch">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Branch name" value={branch?.branchName ?? "—"} />
          <Field label="Branch code" value={branch?.branchCode ?? "—"} />
          <Field label="Location" value={branchLocation || "—"} />
          <Field label="Phone" value={branch?.phone ?? "—"} />
          <Field label="Email" value={branch?.email ?? "—"} />
        </dl>
      </Section>
    </div>
  );
}
