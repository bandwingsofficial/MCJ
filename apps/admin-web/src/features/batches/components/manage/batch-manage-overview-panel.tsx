"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Layers3,
  MonitorPlay,
  UserRound,
} from "lucide-react";

import { Loader } from "@/src/shared/components/ui/loader";
import { cn } from "@/src/shared/lib/cn";

import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchOverviewMetricCards } from "@/src/features/batches/components/manage/batch-overview-metric-cards";
import type {
  Batch,
  BatchMode,
  BatchSummary,
} from "@/src/features/batches/types/batch.types";
import {
  formatBatchDuration,
  formatBatchDurationType,
} from "@/src/features/batches/utils/batch-duration.utils";
import { formatBatchOperationalStatus } from "@/src/features/batches/utils/batch.helper";
import {
  formatBatchOriginalPrice,
  formatBatchPrice,
  getBatchPricing,
} from "@/src/features/batches/utils/batch-pricing.util";
import { calculateBatchProgress } from "@/src/features/batches/utils/batch-progress.utils";
import {
  formatBatchDaysLabel,
  formatBatchOverviewDate,
  formatBatchOverviewTiming,
} from "@/src/features/batches/utils/batch-progress.utils";
import { getTimingsForMode } from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatBatchEnrollmentCapacityLabel,
  getBatchAggregateStats,
  getBatchModeSummaries,
  getTimingEnrolledCount,
} from "@/src/features/batches/utils/batch-timing.utils";
import { categoryService } from "@/src/features/categories/services/category.service";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { useCourseTrainers } from "@/src/features/courses/hooks/use-course-trainers";
import type { CourseTrainer } from "@/src/features/courses/types/course.types";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import { getTrainerDisplayStatus } from "@/src/features/trainers/utils/trainer-display.utils";

import {
  BatchManageEmptyState,
  BatchManageField,
  BatchManageSection,
} from "./batch-manage-section";

interface Props {
  batch: Batch;
  summary: BatchSummary | null;
  summaryLoading?: boolean;
}

const MODE_ACCENTS: Record<
  BatchMode,
  { card: string; chip: string }
> = {
  OFFLINE: {
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
    chip: "bg-amber-50 text-amber-800 ring-amber-100",
  },
  ONLINE: {
    card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  RECORDED: {
    card: "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
    chip: "bg-sky-50 text-sky-700 ring-sky-100",
  },
};

function formatTrainerName(
  trainer: Pick<CourseTrainer, "firstName" | "lastName">,
) {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ") || "—";
}

function getModeCapacity(batch: Batch, mode: BatchMode): number {
  return getTimingsForMode(batch, mode).reduce(
    (total, timing) => total + (timing.capacity ?? 0),
    0,
  );
}

function TrainerCard({ trainer }: { trainer: CourseTrainer }) {
  const name = formatTrainerName(trainer);

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#E1EBF5] bg-[#FAFCFF] p-3 sm:flex-row sm:items-start">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-[#DCE8F5]">
        {trainer.profileImageUrl ? (
          <Image
            src={trainer.profileImageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <UserRound className="h-5 w-5" />
          </div>
        )}
      </div>

      <dl className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
        <BatchManageField label="Trainer Name" value={name} />
        <BatchManageField
          label="Trainer Code"
          value={trainer.employeeCode?.trim() || "—"}
        />
        <BatchManageField
          label="Qualification"
          value={trainer.qualification?.trim() || "—"}
        />
        <BatchManageField
          label="Status"
          value={
            <TrainerStatusBadge
              status={getTrainerDisplayStatus({
                status: trainer.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
              })}
            />
          }
        />
      </dl>
    </article>
  );
}

export function BatchManageOverviewPanel({
  batch,
  summary,
  summaryLoading = false,
}: Props) {
  const progress = useMemo(() => calculateBatchProgress(batch), [batch]);
  const pricing = useMemo(() => getBatchPricing(batch), [batch]);
  const modeSummaries = useMemo(() => getBatchModeSummaries(batch), [batch]);
  const aggregateStats = useMemo(
    () => getBatchAggregateStats(batch),
    [batch],
  );
  const isArchived = Boolean(batch.deletedAt || batch.isDeleted);
  const enrollmentLabel = formatBatchEnrollmentCapacityLabel(batch);

  const courseId = batch.courseId?.trim() || batch.course?.id || "";
  const { course, isLoading: courseLoading } = useCourse(courseId);
  const courseHasTrainers = course?.trainers !== undefined;
  const { trainers: fallbackTrainers, isLoading: fallbackTrainersLoading } =
    useCourseTrainers(courseHasTrainers ? undefined : courseId || undefined);

  const trainers: CourseTrainer[] = useMemo(() => {
    if (course?.trainers) {
      return course.trainers;
    }

    return fallbackTrainers.map((trainer) => ({
      id: trainer.id,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      employeeCode: trainer.employeeCode,
      qualification: trainer.qualification,
      specialization: trainer.specialization,
      status: trainer.status,
      profileImageUrl: trainer.profileImageUrl,
      email: trainer.email,
    }));
  }, [course?.trainers, fallbackTrainers]);

  const trainersLoading =
    courseLoading || (!courseHasTrainers && fallbackTrainersLoading);

  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const categoryId = course?.categoryId || course?.category?.id || null;
  const categoryName =
    course?.category?.name?.trim() ||
    course?.categoryName?.trim() ||
    batch.course?.category?.name?.trim() ||
    batch.category?.name?.trim() ||
    "";

  useEffect(() => {
    if (!categoryId) {
      setCategorySlug(null);
      return;
    }

    let cancelled = false;

    const loadCategory = async () => {
      try {
        setCategoryLoading(true);
        const response = await categoryService.getCategory(categoryId);
        if (!cancelled) {
          setCategorySlug(response.data.slug?.trim() || null);
        }
      } catch {
        if (!cancelled) {
          setCategorySlug(null);
        }
      } finally {
        if (!cancelled) {
          setCategoryLoading(false);
        }
      }
    };

    void loadCategory();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const workingDaysLabel =
    progress.totalWorkingDays !== null
      ? `${progress.totalWorkingDays} working day${progress.totalWorkingDays === 1 ? "" : "s"}`
      : "—";

  const courseTitle =
    course?.title?.trim() || batch.course?.title?.trim() || "";
  const courseCode =
    course?.code?.trim() || batch.course?.code?.trim() || "";

  return (
    <div className="space-y-4">
      <BatchManageSection
        title="Batch Summary"
        description="Aggregated overview across all configured learning modes and timings."
      >
        <BatchOverviewMetricCards
          batch={batch}
          aggregateStats={aggregateStats}
          configuredModesCount={modeSummaries.length}
          trainerCount={summary?.trainerCount}
          isLoading={summaryLoading && !summary}
        />
      </BatchManageSection>

      <BatchManageSection
        title="Learning Mode Breakdown"
        description="Configured modes for this parent batch with timing and enrollment totals."
      >
        {modeSummaries.length === 0 ? (
          <BatchManageEmptyState
            icon={MonitorPlay}
            title="No Learning Modes Configured"
            description="Add batch timings to configure Offline, Online, or Self-Paced modes for this batch."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {modeSummaries.map((row) => {
              const accent = MODE_ACCENTS[row.mode];
              const modeCapacity = getModeCapacity(batch, row.mode);
              const modeEnrollment =
                modeCapacity > 0
                  ? `${row.studentsCount} / ${modeCapacity}`
                  : `${row.studentsCount}`;

              return (
                <div
                  key={row.mode}
                  className={cn(
                    "rounded-xl border p-4 shadow-sm",
                    accent.card,
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <BatchModeBadge mode={row.mode} />
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1",
                        accent.chip,
                      )}
                    >
                      {row.timingsCount} timing
                      {row.timingsCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    <BatchManageField
                      label="Enrolled / Capacity"
                      value={modeEnrollment}
                    />
                    <BatchManageField
                      label="Students"
                      value={`${row.studentsCount} student${row.studentsCount === 1 ? "" : "s"}`}
                    />
                  </dl>
                </div>
              );
            })}
          </div>
        )}
      </BatchManageSection>

      <BatchManageSection
        title="Enrollment Summary"
        description="Parent batch totals calculated from all child batch timings."
      >
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <BatchManageField
            label="Total Enrolled / Capacity"
            value={enrollmentLabel}
          />
          <BatchManageField
            label="Total Capacity"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : aggregateStats.totalCapacity
            }
          />
          <BatchManageField
            label="Total Enrolled"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : aggregateStats.totalEnrolled
            }
          />
          <BatchManageField
            label="Available Seats"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : aggregateStats.totalAvailableSeats
            }
          />
        </dl>
      </BatchManageSection>

      <BatchManageSection
        title="Batch Schedule Summary"
        description="Shared schedule information for this parent batch."
      >
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField
            label="Start Date"
            value={formatBatchOverviewDate(batch.startDate)}
          />
          <BatchManageField
            label="End Date"
            value={formatBatchOverviewDate(batch.endDate)}
          />
          <BatchManageField
            label="Daily Timing"
            value={formatBatchOverviewTiming(batch.startTime, batch.endTime)}
          />
          <BatchManageField
            label="Duration"
            value={formatBatchDuration(batch)}
          />
          <BatchManageField
            label="Duration Type"
            value={formatBatchDurationType(batch)}
          />
          <BatchManageField
            label="Total Working Days"
            value={workingDaysLabel}
          />
          <BatchManageField
            label="Batch Days"
            value={formatBatchDaysLabel(batch.daysOfWeek)}
          />
        </dl>
      </BatchManageSection>

      <BatchManageSection
        title="Important Batch Information"
        description="Core batch details, pricing, and operational statistics."
      >
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField label="Batch Name" value={batch.name} />
          <BatchManageField label="Batch Number" value={batch.code} />
          <BatchManageField
            label="Course"
            value={batch.course?.title?.trim() || "No course assigned"}
          />
          <BatchManageField
            label="Status"
            value={
              <BatchStatusBadge
                status={batch.status}
                isActive={batch.isActive}
                isDeleted={isArchived}
                startDate={batch.startDate}
                endDate={batch.endDate}
              />
            }
          />
          <BatchManageField
            label="Operational State"
            value={formatBatchOperationalStatus(batch)}
          />
          <BatchManageField
            label="Featured"
            value={batch.isFeatured ? "Yes" : "No"}
          />
          <BatchManageField label="Final Price" value={formatBatchPrice(batch)} />
          <BatchManageField
            label="Original Price"
            value={formatBatchOriginalPrice(batch)}
          />
          <BatchManageField label="Currency" value={pricing.currency} />
        </dl>

        {summaryLoading && !summary ? (
          <div className="mt-4 border-t border-[#E1EBF5] pt-4">
            <Loader />
          </div>
        ) : summary ? (
          <div className="mt-4 border-t border-[#E1EBF5] pt-4">
            <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
              Attendance Statistics
            </h3>
            <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
              <BatchManageField
                label="Attendance Present"
                value={summary.attendancePresent}
              />
              <BatchManageField
                label="Attendance Absent"
                value={summary.attendanceAbsent}
              />
            </dl>
          </div>
        ) : null}
      </BatchManageSection>

      <BatchManageSection
        title="Course & Trainers"
        description="Linked course, category, and assigned trainers for this batch."
      >
        {!courseId ? (
          <BatchManageEmptyState
            icon={Layers3}
            title="No Course Assigned"
            description="Assign a course to this batch to view course and trainer details."
          />
        ) : courseLoading && !course && !batch.course ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            <dl className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <BatchManageField
                label="Course Name"
                value={courseTitle || "—"}
              />
              <BatchManageField
                label="Course Code"
                value={courseCode || "—"}
              />
              <BatchManageField
                label="Category Name"
                value={categoryName || "—"}
              />
              <BatchManageField
                label="Category Code"
                value={categoryLoading ? "…" : categorySlug || "—"}
              />
            </dl>

            <div className="border-t border-[#E1EBF5] pt-4">
              <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
                Trainer Details
              </h3>
              {trainersLoading ? (
                <Loader />
              ) : trainers.length === 0 ? (
                <BatchManageEmptyState
                  icon={UserRound}
                  title="No Trainers Assigned"
                  description="Trainers will appear here once assigned to the linked course."
                />
              ) : (
                <div className="space-y-3">
                  {trainers.map((trainer) => (
                    <TrainerCard key={trainer.id} trainer={trainer} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </BatchManageSection>
    </div>
  );
}
