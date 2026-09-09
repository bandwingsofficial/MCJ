"use client";

import Image from "next/image";
import { useMemo, type ReactNode } from "react";
import { UserRound } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import { BatchModeBadge } from "@/src/features/branch-ops/components/batches/batch-mode-badge";
import { BatchStatusBadge } from "@/src/features/branch-ops/components/batches/batch-status-badge";
import type {
  BatchListItem,
  BatchSummary,
} from "@/src/features/branch-ops/types";
import { courseTitle, trainerNames } from "@/src/features/branch-ops/utils/batch-display";
import { getConfiguredBatchModeSummaries } from "@/src/features/branch-ops/utils/batch-mode.utils";
import {
  formatBatchDuration,
  formatBatchDurationType,
  formatBatchDaysLabel,
  formatBatchEnrollmentCapacityLabel,
  formatBatchOverviewDate,
  formatBatchOverviewTiming,
  formatBatchTimeLabel,
  getBatchAggregateStats,
} from "@/src/features/branch-ops/utils/batch-timing.utils";

interface Props {
  batch: BatchListItem;
  summary: BatchSummary | null;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-[#102A56]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

function OverviewField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-[#102A56]">
        {value}
      </dd>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-[#647A9B]">
      {message}
    </p>
  );
}

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function BatchManageOverviewPanel({ batch, summary }: Props) {
  const modeSummaries = useMemo(
    () => getConfiguredBatchModeSummaries(batch),
    [batch],
  );
  const aggregateStats = useMemo(() => getBatchAggregateStats(batch), [batch]);
  const enrolledLabel = formatBatchEnrollmentCapacityLabel(batch);
  const summaryEnrolledLabel =
    summary != null && aggregateStats.totalTimings > 0
      ? `${summary.studentsCount} / ${summary.capacity}`
      : enrolledLabel;
  const workingDaysLabel =
    batch.totalWorkingDays != null
      ? `${batch.totalWorkingDays} working day${batch.totalWorkingDays === 1 ? "" : "s"}`
      : "—";
  const trainers = batch.trainers ?? [];
  const trainerLabel = trainerNames(trainers);

  return (
    <div className="space-y-4">
      <SectionCard title="Batch Details">
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewField label="Batch Name" value={batch.name} />
          <OverviewField label="Batch Number" value={batch.code} />
          <OverviewField
            label="Course"
            value={courseTitle(batch.course)}
          />
          <OverviewField
            label="Branch"
            value={batch.branch?.branchName?.trim() || "—"}
          />
          <OverviewField
            label="Total Batch Timings"
            value={
              aggregateStats.totalTimings === 0
                ? "No timings"
                : String(aggregateStats.totalTimings)
            }
          />
          <OverviewField
            label="Offline Timings"
            value={String(aggregateStats.offlineTimingsCount)}
          />
          <OverviewField
            label="Online Timings"
            value={String(aggregateStats.onlineTimingsCount)}
          />
          <OverviewField
            label="Self-Paced Timings"
            value={String(aggregateStats.recordedTimingsCount)}
          />
          <OverviewField
            label="Status"
            value={<BatchStatusBadge status={batch.status} />}
          />
          <OverviewField
            label="Total Capacity"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : aggregateStats.totalCapacity
            }
          />
          <OverviewField label="Total Enrolled" value={enrolledLabel} />
          <OverviewField
            label="Available Seats"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : aggregateStats.totalAvailableSeats
            }
          />
        </dl>
      </SectionCard>

      <SectionCard title="Learning Modes">
        {modeSummaries.length === 0 ? (
          <EmptyMessage message="No batch timings are linked to this batch yet." />
        ) : (
          <div className="space-y-2">
            {modeSummaries.map((row) => (
              <div
                key={row.mode}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-[#102A56]">{row.label}</span>
                <span className="text-[#647A9B]">
                  {row.timingsCount} timing
                  {row.timingsCount === 1 ? "" : "s"} → {row.studentsCount}{" "}
                  student{row.studentsCount === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Schedule">
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewField
            label="Start Date"
            value={formatBatchOverviewDate(batch.startDate)}
          />
          <OverviewField
            label="End Date"
            value={formatBatchOverviewDate(batch.endDate)}
          />
          <OverviewField
            label="Start Time"
            value={formatBatchTimeLabel(batch.startTime)}
          />
          <OverviewField
            label="End Time"
            value={formatBatchTimeLabel(batch.endTime)}
          />
          <OverviewField
            label="Daily Timing"
            value={formatBatchOverviewTiming(batch.startTime, batch.endTime)}
          />
          <OverviewField label="Duration" value={formatBatchDuration(batch)} />
          <OverviewField
            label="Duration Type"
            value={formatBatchDurationType(batch)}
          />
          <OverviewField
            label="Total Working Days"
            value={workingDaysLabel}
          />
          <OverviewField
            label="Batch Days"
            value={formatBatchDaysLabel(batch.daysOfWeek)}
          />
        </dl>
      </SectionCard>

      <SectionCard title="Other Details">
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewField
            label="Category"
            value={batch.course?.category?.name?.trim() || "—"}
          />
          <OverviewField label="Trainers" value={trainerLabel} />
        </dl>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Batch Statistics
          </h3>
          {summary ? (
            <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <OverviewField label="Students" value={summary.studentsCount} />
              <OverviewField label="Trainers" value={summary.trainerCount} />
              <OverviewField
                label="Enrolled / Capacity"
                value={summaryEnrolledLabel}
              />
              <OverviewField
                label="Attendance Present"
                value={summary.attendancePresent}
              />
              <OverviewField
                label="Attendance Absent"
                value={summary.attendanceAbsent}
              />
            </dl>
          ) : (
            <p className="text-sm text-[#647A9B]">
              Statistics are unavailable for this batch.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Course Details">
        {!batch.course ? (
          <EmptyMessage message="No course assigned" />
        ) : (
          <div className="space-y-6">
            <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <OverviewField
                label="Course Name"
                value={courseTitle(batch.course)}
              />
              <OverviewField
                label="Course Code"
                value={batch.course.code?.trim() || "—"}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <OverviewField
                  label="Description"
                  value={batch.course.description?.trim() || "—"}
                />
              </div>
            </dl>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Trainer Details
              </h3>
              {trainers.length === 0 ? (
                <EmptyMessage message="Not yet assigned" />
              ) : (
                <div className="space-y-3">
                  {trainers.map((trainer) => {
                    const name =
                      trainer.name?.trim() ||
                      [trainer.firstName, trainer.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                      "—";

                    return (
                      <article
                        key={trainer.id}
                        className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-start"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100">
                          {trainer.profileImageUrl ? (
                            <Image
                              src={trainer.profileImageUrl}
                              alt={name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <UserRound className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <dl className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                          <OverviewField label="Trainer Name" value={name} />
                          <OverviewField
                            label="Qualification"
                            value={trainer.qualification?.trim() || "—"}
                          />
                          <OverviewField
                            label="Specialization"
                            value={trainer.specialization?.trim() || "—"}
                          />
                        </dl>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>

      {Object.entries(batch.modePricing ?? {}).length > 0 ? (
        <SectionCard title="Mode Pricing">
          <div className="space-y-4">
            {modeSummaries.map((row) => {
              const pricing = batch.modePricing?.[row.mode];
              if (!pricing) return null;

              return (
                <div key={row.mode} className="rounded-lg border border-slate-200 p-3">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <BatchModeBadge mode={row.mode} />
                    <span className="text-sm text-[#647A9B]">
                      {row.timingsCount} timing
                      {row.timingsCount === 1 ? "" : "s"} · {row.studentsCount}{" "}
                      student{row.studentsCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <OverviewField
                      label="Original Price"
                      value={formatMoney(
                        pricing.originalPrice,
                        pricing.currency,
                      )}
                    />
                    <OverviewField
                      label="Discount Amount"
                      value={formatMoney(
                        pricing.discountAmount,
                        pricing.currency,
                      )}
                    />
                    <OverviewField
                      label="Final Amount"
                      value={
                        pricing.discountedPrice <= 0
                          ? "Free"
                          : formatMoney(
                              pricing.discountedPrice,
                              pricing.currency,
                            )
                      }
                    />
                  </dl>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
