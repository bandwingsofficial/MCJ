"use client";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  assignedLabel,
  courseTitle,
  formatBatchDate,
  formatBatchMode,
  formatBatchStatus,
  formatBatchTiming,
  formatWorkingDays,
  trainerNames,
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
  const trainers = batch.trainers ?? [];
  const branch = batch.branch;
  const branchLocation = [branch?.addressLine1, branch?.city, branch?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section title="Batch information">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Batch name" value={batch.name} />
          <Field label="Batch code" value={batch.code} />
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
            label="Daily timing"
            value={formatBatchTiming(batch.startTime, batch.endTime)}
          />
          <Field
            label="Mode"
            value={formatBatchMode(batch.mode)}
          />
        </dl>
      </Section>

      <Section title="Course summary">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Course name" value={courseTitle(batch.course)} />
          <Field label="Course code" value={assignedLabel(batch.course?.code)} />
          <Field
            label="Category"
            value={assignedLabel(batch.course?.category?.name)}
          />
          <Field
            label="Duration"
            value={assignedLabel(batch.course?.duration)}
          />
        </dl>
        {batch.course?.description ? (
          <p className="mt-4 text-sm leading-6 text-[#334155]">
            {batch.course.description}
          </p>
        ) : null}
      </Section>

      <Section title="Trainer">
        {!trainers.length ? (
          <p className="text-sm text-[#647A9B]">Not assigned</p>
        ) : (
          <div className="space-y-4">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="flex gap-3">
                {trainer.profileImageUrl ? (
                  <img
                    src={trainer.profileImageUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : null}
                <dl className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <Field
                    label="Trainer name"
                    value={assignedLabel(trainerNames([trainer]))}
                  />
                  <Field
                    label="Qualification"
                    value={assignedLabel(trainer.qualification)}
                  />
                  <Field
                    label="Specialization"
                    value={assignedLabel(trainer.specialization)}
                  />
                  <Field
                    label="Experience"
                    value={
                      trainer.experienceYears != null
                        ? `${trainer.experienceYears} year${
                            trainer.experienceYears === 1 ? "" : "s"
                          }`
                        : "Not assigned"
                    }
                  />
                </dl>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Enrollment">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Total capacity"
            value={batch.capacity == null ? "Not assigned" : String(batch.capacity)}
          />
          <Field
            label="Enrolled students"
            value={String(batch.enrolledStudents)}
          />
          <Field
            label="Available seats"
            value={
              batch.availableSeats == null
                ? "Not assigned"
                : String(batch.availableSeats)
            }
          />
        </dl>
      </Section>

      <Section title="Branch">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Branch name"
            value={assignedLabel(branch?.branchName)}
          />
          <Field
            label="Branch code"
            value={assignedLabel(branch?.branchCode)}
          />
          <Field label="Location" value={assignedLabel(branchLocation)} />
          <Field label="Phone" value={assignedLabel(branch?.phone)} />
          <Field label="Email" value={assignedLabel(branch?.email)} />
        </dl>
      </Section>
    </div>
  );
}
