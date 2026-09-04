"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { UserRound } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { Loader } from "@/src/shared/components/ui/loader";

import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { BATCH_DURATION_TYPES } from "@/src/features/batches/constants/batch.constants";
import type {
  Batch,
  BatchSummary,
} from "@/src/features/batches/types/batch.types";
import {
  formatBatchMode,
  formatBatchOperationalStatus,
  formatBatchTime,
} from "@/src/features/batches/utils/batch.helper";
import {
  formatBatchOriginalPrice,
  formatBatchPrice,
  getBatchPricing,
} from "@/src/features/batches/utils/batch-pricing.util";
import {
  calculateBatchProgress,
  formatBatchDaysLabel,
  formatBatchOverviewDate,
  formatBatchOverviewTiming,
} from "@/src/features/batches/utils/batch-progress.utils";
import { categoryService } from "@/src/features/categories/services/category.service";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { useCourseTrainers } from "@/src/features/courses/hooks/use-course-trainers";
import type { CourseTrainer } from "@/src/features/courses/types/course.types";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import { getTrainerDisplayStatus } from "@/src/features/trainers/utils/trainer-display.utils";

interface Props {
  batch: Batch;
  summary: BatchSummary | null;
  summaryLoading?: boolean;
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

function formatConfiguredDuration(batch: Batch): string {
  if (
    batch.durationValue == null ||
    !batch.durationType ||
    Number(batch.durationValue) <= 0
  ) {
    return "—";
  }

  const typeLabel =
    BATCH_DURATION_TYPES.find((item) => item.value === batch.durationType)
      ?.label ?? batch.durationType;
  const value = Number(batch.durationValue);
  const singular = typeLabel.replace(/s$/i, "");

  return `${value} ${value === 1 ? singular : typeLabel.toLowerCase()}`;
}

function formatDurationType(batch: Batch): string {
  if (!batch.durationType) {
    return "—";
  }

  return (
    BATCH_DURATION_TYPES.find((item) => item.value === batch.durationType)
      ?.label ?? batch.durationType
  );
}

function formatTrainerName(
  trainer: Pick<CourseTrainer, "firstName" | "lastName">,
) {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ") || "—";
}

function TrainerCard({ trainer }: { trainer: CourseTrainer }) {
  const name = formatTrainerName(trainer);

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-start">
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
          label="Trainer Code"
          value={trainer.employeeCode?.trim() || "—"}
        />
        <OverviewField
          label="Qualification"
          value={trainer.qualification?.trim() || "—"}
        />
        <OverviewField
          label="Specialization"
          value={trainer.specialization?.trim() || "—"}
        />
        <div className="sm:col-span-2">
          <OverviewField
            label="Status"
            value={
              <TrainerStatusBadge
                status={getTrainerDisplayStatus({
                  status: trainer.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
                })}
              />
            }
          />
        </div>
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
  const isArchived = Boolean(batch.deletedAt || batch.isDeleted);

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

  const enrolledLabel =
    summary != null
      ? `${summary.enrolledCount} / ${summary.capacity}`
      : `${batch.enrolledCount} / ${batch.capacity}`;

  const courseTitle =
    course?.title?.trim() || batch.course?.title?.trim() || "";
  const courseCode =
    course?.code?.trim() || batch.course?.code?.trim() || "";
  const courseDescription =
    course?.shortDescription?.trim() ||
    course?.description?.trim() ||
    batch.course?.shortDescription?.trim() ||
    batch.course?.description?.trim() ||
    "";

  return (
    <div className="space-y-4">
      <SectionCard title="Batch Details">
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewField label="Batch Name" value={batch.name} />
          <OverviewField label="Batch Code" value={batch.code} />
          <OverviewField
            label="Course"
            value={batch.course?.title?.trim() || "No course assigned"}
          />
          <OverviewField
            label="Batch Type"
            value={formatBatchMode(batch.mode)}
          />
          <OverviewField
            label="Status"
            value={
              <BatchStatusBadge
                status={batch.status}
                isActive={batch.isActive}
                isDeleted={isArchived}
              />
            }
          />
          <OverviewField
            label="Operational State"
            value={formatBatchOperationalStatus(batch)}
          />
          <OverviewField label="Capacity" value={batch.capacity} />
          <OverviewField label="Enrollment" value={enrolledLabel} />
          {batch.description?.trim() ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <OverviewField
                label="Description"
                value={batch.description.trim()}
              />
            </div>
          ) : null}
        </dl>
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
            value={formatBatchTime(batch.startTime)}
          />
          <OverviewField
            label="End Time"
            value={formatBatchTime(batch.endTime)}
          />
          <OverviewField
            label="Daily Timing"
            value={formatBatchOverviewTiming(batch.startTime, batch.endTime)}
          />
          <OverviewField
            label="Duration"
            value={formatConfiguredDuration(batch)}
          />
          <OverviewField
            label="Duration Type"
            value={formatDurationType(batch)}
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
            label="Featured"
            value={batch.isFeatured ? "Yes" : "No"}
          />
          <OverviewField
            label="Category"
            value={
              batch.category?.name?.trim() ||
              batch.course?.category?.name?.trim() ||
              "—"
            }
          />
          <OverviewField
            label="Final Price"
            value={formatBatchPrice(batch)}
          />
          <OverviewField
            label="Original Price"
            value={formatBatchOriginalPrice(batch)}
          />
          <OverviewField
            label="Discount"
            value={
              pricing.isFree
                ? "—"
                : new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: pricing.currency,
                    maximumFractionDigits: 2,
                  }).format(pricing.discountAmount)
            }
          />
          <OverviewField label="Currency" value={pricing.currency} />
        </dl>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Batch Statistics
          </h3>
          {summaryLoading && !summary ? (
            <p className="text-sm text-[#647A9B]">Loading statistics…</p>
          ) : summary ? (
            <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <OverviewField
                label="Students"
                value={summary.studentsCount}
              />
              <OverviewField
                label="Trainers"
                value={summary.trainerCount}
              />
              <OverviewField
                label="Enrolled"
                value={`${summary.enrolledCount} / ${summary.capacity}`}
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
        {!courseId ? (
          <EmptyMessage message="No course assigned" />
        ) : courseLoading && !course && !batch.course ? (
          <div className="py-6">
            <Loader />
          </div>
        ) : (
          <div className="space-y-6">
            <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <OverviewField
                label="Course Name"
                value={courseTitle || "—"}
              />
              <OverviewField
                label="Course Code"
                value={courseCode || "—"}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <OverviewField
                  label="Description"
                  value={courseDescription || "—"}
                />
              </div>
            </dl>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category Details
              </h3>
              {!categoryName && !categoryId ? (
                <EmptyMessage message="No category available" />
              ) : (
                <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <OverviewField
                    label="Category Name"
                    value={categoryName || "—"}
                  />
                  <OverviewField
                    label="Category Code"
                    value={categoryLoading ? "…" : categorySlug || "—"}
                  />
                </dl>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Trainer Details
              </h3>
              {trainersLoading ? (
                <div className="py-4">
                  <Loader />
                </div>
              ) : trainers.length === 0 ? (
                <EmptyMessage message="Not yet assigned" />
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
      </SectionCard>
    </div>
  );
}
