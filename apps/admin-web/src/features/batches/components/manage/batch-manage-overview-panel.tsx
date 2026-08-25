"use client";

import Image from "next/image";
import { ImageOff, UserRound } from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { Card } from "@/src/shared/components/ui/card";

import type {
  Batch,
  BatchCourseAssignment,
} from "@/src/features/batches/types/batch.types";
import {
  formatBatchMode,
  formatBatchOperationalStatus,
  formatBatchTime,
} from "@/src/features/batches/utils/batch.helper";
import {
  formatAssignedCoursePrice,
  formatAssignedCourseQualifications,
  formatTrainerDisplayName,
  getCourseCategoryName,
  getCourseDescription,
  getUniqueAssignedCourses,
  getUniqueBatchTrainers,
  formatDaysRemainingOrExpiredStatus,
} from "@/src/features/batches/utils/batch-course.utils";
import {
  calculateBatchProgress,
  formatBatchDaysLabel,
  formatBatchDurationLabel,
  formatBatchLifecycleStatus,
  formatBatchOverviewDate,
  formatBatchOverviewTiming,
} from "@/src/features/batches/utils/batch-progress.utils";
import type { TrainerStatus } from "@/src/features/trainers/types/trainer.types";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import { getTrainerDisplayStatus } from "@/src/features/trainers/utils/trainer-display.utils";

interface Props {
  batch: Batch;
  assignments: BatchCourseAssignment[];
  assignmentsLoading?: boolean;
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
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
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
      <dd className="mt-0.5 break-words text-sm font-medium text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function resolveTrainerStatus(status?: string): TrainerStatus {
  if (status === "ACTIVE" || status === "ARCHIVED" || status === "INACTIVE") {
    return status;
  }

  return "INACTIVE";
}

function EmptySectionMessage({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </p>
  );
}

export function BatchManageOverviewPanel({
  batch,
  assignments,
  assignmentsLoading = false,
}: Props) {
  const progress = useMemo(() => calculateBatchProgress(batch), [batch]);

  const assignedCourses = useMemo(
    () => getUniqueAssignedCourses(assignments),
    [assignments],
  );

  const assignedTrainers = useMemo(
    () => getUniqueBatchTrainers(batch, assignments),
    [assignments, batch],
  );

  const daysRemainingLabel = formatDaysRemainingOrExpiredStatus(
    progress.isExpired,
    progress.isNotStarted,
    progress.daysRemaining,
    progress.daysUntilStart,
  );

  const lifecycleStatus = formatBatchLifecycleStatus(progress);
  const durationLabel = formatBatchDurationLabel(batch);
  const workingDaysLabel =
    progress.totalWorkingDays !== null
      ? `${progress.totalWorkingDays} working day${progress.totalWorkingDays === 1 ? "" : "s"}`
      : "—";

  return (
    <div className="space-y-4">
      <SectionCard title="Batch Information">
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
          <OverviewField label="Batch Name" value={batch.name} />
          <OverviewField label="Batch Code" value={batch.code} />
          <OverviewField label="Batch Type" value={formatBatchMode(batch.mode)} />
          <OverviewField label="Capacity" value={batch.capacity} />
          <OverviewField
            label="Start Date"
            value={formatBatchOverviewDate(batch.startDate)}
          />
          <OverviewField
            label="End Date"
            value={formatBatchOverviewDate(batch.endDate)}
          />
          <OverviewField
            label="Current Status"
            value={formatBatchOperationalStatus(batch)}
          />
          <OverviewField label="Duration" value={durationLabel} />
          {batch.description?.trim() ? (
            <div className="sm:col-span-2">
              <OverviewField
                label="Description"
                value={batch.description.trim()}
              />
            </div>
          ) : null}
        </dl>
      </SectionCard>

      <SectionCard title="Course Information">
        {assignmentsLoading ? (
          <p className="text-sm text-slate-500">Loading assigned courses…</p>
        ) : assignedCourses.length === 0 ? (
          <EmptySectionMessage message="No courses yet" />
        ) : (
          <div className="space-y-3">
            {assignedCourses.map((assignment) => {
              const course = assignment.course;
              const categoryName = getCourseCategoryName(assignment);
              const description = getCourseDescription(course);

              return (
                <article
                  key={assignment.id}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row"
                >
                  <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-28">
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
                        <ImageOff className="h-5 w-5" />
                        <span className="text-[10px] font-medium">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {course.title}
                      </h3>
                      {course.code ? (
                        <p className="text-xs font-medium text-blue-600">
                          {course.code}
                        </p>
                      ) : null}
                    </div>

                    {description ? (
                      <p className="text-sm leading-relaxed text-slate-600">
                        {description}
                      </p>
                    ) : null}

                    <dl className="grid min-w-0 gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-slate-500">Category</dt>
                        <dd className="font-medium text-slate-900">
                          {categoryName || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">
                          Minimum Qualification Required
                        </dt>
                        <dd className="font-medium text-slate-900">
                          {formatAssignedCourseQualifications(course)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Final Price</dt>
                        <dd className="font-medium text-slate-900">
                          {formatAssignedCoursePrice(course)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Trainer Information">
        {assignmentsLoading ? (
          <p className="text-sm text-slate-500">Loading assigned trainers…</p>
        ) : assignedTrainers.length === 0 ? (
          <EmptySectionMessage message="No trainers yet" />
        ) : (
          <div className="space-y-3">
            {assignedTrainers.map((trainer) => {
              const name = formatTrainerDisplayName(trainer) || "—";

              return (
                <article
                  key={trainer.id}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center"
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

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {name}
                      </h3>
                      <TrainerStatusBadge
                        status={getTrainerDisplayStatus({
                          status: resolveTrainerStatus(trainer.status),
                          deletedAt: null,
                          isDeleted: false,
                        })}
                      />
                    </div>

                    <dl className="grid min-w-0 gap-1 text-sm sm:grid-cols-2">
                      {trainer.employeeCode ? (
                        <div>
                          <dt className="text-xs text-slate-500">Employee Code</dt>
                          <dd className="font-medium text-slate-900">
                            {trainer.employeeCode}
                          </dd>
                        </div>
                      ) : null}
                      {trainer.specialization?.trim() ? (
                        <div>
                          <dt className="text-xs text-slate-500">Specialization</dt>
                          <dd className="font-medium text-slate-900">
                            {trainer.specialization}
                          </dd>
                        </div>
                      ) : null}
                      {trainer.qualification?.trim() ? (
                        <div>
                          <dt className="text-xs text-slate-500">Qualification</dt>
                          <dd className="font-medium text-slate-900">
                            {trainer.qualification}
                          </dd>
                        </div>
                      ) : null}
                      {trainer.email?.trim() ? (
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-slate-500">Email</dt>
                          <dd className="break-all font-medium text-slate-900">
                            {trainer.email}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Schedule Information">
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
          <OverviewField
            label="Start Date"
            value={formatBatchOverviewDate(batch.startDate)}
          />
          <OverviewField
            label="End Date"
            value={formatBatchOverviewDate(batch.endDate)}
          />
          <OverviewField
            label="Selected Batch Days"
            value={formatBatchDaysLabel(batch.daysOfWeek)}
          />
          <OverviewField
            label="Daily Start Time"
            value={formatBatchTime(batch.startTime)}
          />
          <OverviewField
            label="Daily End Time"
            value={formatBatchTime(batch.endTime)}
          />
          <OverviewField
            label="Daily Timing"
            value={formatBatchOverviewTiming(batch.startTime, batch.endTime)}
          />
          <OverviewField label="Total Duration" value={durationLabel} />
          <OverviewField label="Working Days" value={workingDaysLabel} />
          <OverviewField label="Batch Progress" value={lifecycleStatus} />
          <OverviewField
            label="Days Remaining / Expired Status"
            value={daysRemainingLabel}
          />
        </dl>
      </SectionCard>
    </div>
  );
}
