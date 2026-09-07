"use client";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import { BatchAssignedTimingsPanel } from "@/src/features/branch-ops/components/batches/batch-assigned-timings-panel";
import { BatchEnrolledSummary } from "@/src/features/branch-ops/components/batches/batch-enrolled-summary";
import {
  courseTitle,
  formatBatchDate,
  formatBatchDurationLabel,
  formatBatchStatus,
  formatLearningModes,
} from "@/src/features/branch-ops/utils/batch-display";
import { Card } from "@/src/shared/components/ui/card";

interface Props {
  batch: BatchListItem;
  sections?: Array<"summary" | "enrolled" | "timings">;
  timingsVariant?: "manage" | "details";
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

export function BatchOverviewPanel({
  batch,
  sections = ["summary", "enrolled", "timings"],
  timingsVariant = "manage",
}: Props) {
  const showSummary = sections.includes("summary");
  const showEnrolled = sections.includes("enrolled");
  const showTimings = sections.includes("timings");

  return (
    <div className="space-y-4">
      {showSummary ? (
        <Section title="Batch summary">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Batch name" value={batch.name} />
            <Field label="Batch number" value={batch.code} />
            <Field label="Course" value={courseTitle(batch.course)} />
            <Field
              label="Learning mode"
              value={formatLearningModes(batch.learningModes, batch.mode)}
            />
            <Field label="Start date" value={formatBatchDate(batch.startDate)} />
            <Field label="End date" value={formatBatchDate(batch.endDate)} />
            <Field label="Duration" value={formatBatchDurationLabel(batch)} />
            <Field
              label="Total capacity"
              value={batch.capacity == null ? "—" : String(batch.capacity)}
            />
            <Field
              label="Total enrolled students"
              value={String(batch.enrolledStudents)}
            />
            <Field
              label="Available seats"
              value={
                batch.availableSeats == null ? "—" : String(batch.availableSeats)
              }
            />
            <Field label="Batch status" value={formatBatchStatus(batch.status)} />
          </dl>
        </Section>
      ) : null}

      {showEnrolled ? (
        <Section title="Enrolled students summary">
          <BatchEnrolledSummary batch={batch} students={batch.students} />
        </Section>
      ) : null}

      {showTimings ? (
        <Section title="Assigned batch timings">
          <BatchAssignedTimingsPanel batch={batch} variant={timingsVariant} />
        </Section>
      ) : null}
    </div>
  );
}
