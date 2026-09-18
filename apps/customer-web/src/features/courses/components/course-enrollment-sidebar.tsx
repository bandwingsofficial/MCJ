"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";
import { MCJ_CONTACT } from "@/src/shared/constants/site.constants";

import type { Batch, BatchMode, DayOfWeek } from "@/src/features/batches/types/batch.types";
import {
  formatBatchPrice,
  formatCurrency,
  hasBatchDiscount,
  type BatchPricing,
} from "@/src/features/batches/utils/batch-pricing.utils";
import { useBranches } from "@/src/features/branches/hooks/useBranches";
import { PAYMENT_GATEWAYS } from "@/src/features/payments/constants/payment.constants";
import type { CourseBranch } from "@/src/features/courses/types/course.types";
import {
  COURSE_MODE_ORDER,
  isUpcomingTiming,
  resolveModePricing,
} from "@/src/features/courses/utils/course-batch.utils";
import { getCourseEnrollPath } from "@/src/features/courses/utils/course-route.utils";
import { saveEnrollmentSelection } from "@/src/features/enrollments/utils/enrollment-selection-storage";
import {
  formatBatchDays,
  formatEnrollmentDate,
  formatEnrollmentTime,
  isBatchDateExpired,
  isBatchSelectable,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";

interface CourseEnrollmentSidebarProps {
  batches: Batch[];
  courseBranches?: CourseBranch[];
  courseSlug: string;
  courseId: string;
  courseTitle?: string;
  isEnrolled: boolean | null;
  isLoading?: boolean;
}

interface TimingOption {
  key: string;
  batchId: string;
  branchId: string;
  branchName: string;
  mode: BatchMode;
  timingId?: string;
  timingName: string;
  days: string;
  daysOfWeek: DayOfWeek[];
  startDateIso: string;
  startDateLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  startTime: string;
  endTime: string;
  showTimeRange: boolean;
  joinEnabled: boolean;
}

const MODE_SEGMENT_LABELS: Record<BatchMode, string> = {
  OFFLINE: "Offline",
  ONLINE: "Online",
  RECORDED: "Self-Paced",
};

const PAYMENT_PARTNER_LABELS = Object.values(PAYMENT_GATEWAYS).map((gateway) =>
  gateway === "RAZORPAY" ? "Razorpay" : gateway,
);

function buildWhatsAppUrl(courseTitle?: string): string {
  const digits = MCJ_CONTACT.phone.replace(/\D/g, "");
  const text = courseTitle
    ? `Hi MCJ Academy, I'd like to know more about ${courseTitle}.`
    : "Hi MCJ Academy, I'd like to know more about this course.";

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function isActiveBranchStatus(status: string | null | undefined): boolean {
  if (!status) {
    return true;
  }

  return status.toUpperCase() === "ACTIVE";
}

function resolveBatchBranchIds(batch: Batch): string[] {
  const fromAssignments = batch.assignedBranchIds ?? [];
  const ids = [
    ...fromAssignments,
    ...(batch.branchId ? [batch.branchId] : []),
  ].filter(Boolean);
  return Array.from(new Set(ids));
}

/*
 * Sidebar eligibility is intentionally broader than list-table "upcoming"
 * filtering: include any non-cancelled parent that still exposes upcoming
 * timings, so every branch with bookable slots appears in Preferred Branch.
 */
function isSidebarEligibleBatch(batch: Batch): boolean {
  if (batch.isDeleted) {
    return false;
  }

  if (batch.status === "CANCELLED" || batch.status === "COMPLETED") {
    return false;
  }

  if (resolveBatchBranchIds(batch).length === 0) {
    return false;
  }

  const upcomingTimings = (batch.timings ?? []).filter(isUpcomingTiming);
  if (upcomingTimings.length > 0) {
    return true;
  }

  if (isBatchDateExpired(batch)) {
    return false;
  }

  return batch.status === "UPCOMING";
}

function resolveBranchNameForId(
  branchId: string,
  batch: Batch,
  courseBranches: CourseBranch[],
  publicBranchNames: Map<string, string>,
): string {
  if (batch.branchId === branchId && batch.branch?.branchName?.trim()) {
    return batch.branch.branchName.trim();
  }

  const fromCourse = courseBranches
    .find((branch) => branch.id === branchId)
    ?.branchName?.trim();
  if (fromCourse) {
    return fromCourse;
  }

  return publicBranchNames.get(branchId)?.trim() || "";
}

function buildTimingOptions(
  batches: Batch[],
  courseBranches: CourseBranch[],
  publicBranchNames: Map<string, string>,
): TimingOption[] {
  const options: TimingOption[] = [];

  batches.filter(isSidebarEligibleBatch).forEach((batch) => {
    const branchIds = resolveBatchBranchIds(batch);
    const joinEnabled = isBatchSelectable(batch);
    const upcomingTimings = (batch.timings ?? []).filter(isUpcomingTiming);

    branchIds.forEach((branchId) => {
      const resolvedName =
        resolveBranchNameForId(
          branchId,
          batch,
          courseBranches,
          publicBranchNames,
        ) ||
        publicBranchNames.get(branchId) ||
        courseBranches.find((branch) => branch.id === branchId)?.branchName?.trim() ||
        branchId;

      if (upcomingTimings.length > 0) {
        upcomingTimings.forEach((timing) => {
          const showTimeRange =
            timing.mode !== "RECORDED" &&
            Boolean(timing.startTime) &&
            Boolean(timing.endTime);

          options.push({
            key: `${batch.id}:${branchId}:${timing.id}`,
            batchId: batch.id,
            branchId,
            branchName: resolvedName,
            mode: timing.mode,
            timingId: timing.id,
            timingName: timing.name?.trim() || batch.name,
            days:
              timing.mode === "RECORDED"
                ? "Flexible Learning"
                : formatBatchDays(timing.daysOfWeek ?? []),
            daysOfWeek: timing.daysOfWeek ?? [],
            startDateIso: timing.startDate,
            startDateLabel: formatEnrollmentDate(timing.startDate),
            startTimeLabel: formatEnrollmentTime(timing.startTime),
            endTimeLabel: formatEnrollmentTime(timing.endTime),
            startTime: timing.startTime,
            endTime: timing.endTime,
            showTimeRange,
            joinEnabled,
          });
        });
        return;
      }

      const showTimeRange =
        batch.mode !== "RECORDED" &&
        Boolean(batch.startTime) &&
        Boolean(batch.endTime);

      options.push({
        key: `${batch.id}:${branchId}:batch`,
        batchId: batch.id,
        branchId,
        branchName: resolvedName,
        mode: batch.mode,
        timingName: batch.name,
        days:
          batch.mode === "RECORDED"
            ? "Flexible Learning"
            : formatBatchDays(batch.daysOfWeek ?? []),
        daysOfWeek: batch.daysOfWeek ?? [],
        startDateIso: batch.startDate,
        startDateLabel: formatEnrollmentDate(batch.startDate),
        startTimeLabel: formatEnrollmentTime(batch.startTime),
        endTimeLabel: formatEnrollmentTime(batch.endTime),
        startTime: batch.startTime,
        endTime: batch.endTime,
        showTimeRange,
        joinEnabled,
      });
    });
  });

  return options;
}

function uniqueBranchIds(options: TimingOption[]): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();

  options.forEach((option) => {
    if (seen.has(option.branchId)) {
      return;
    }
    seen.add(option.branchId);
    ids.push(option.branchId);
  });

  return ids;
}

export function CourseEnrollmentSidebar({
  batches,
  courseBranches = [],
  courseSlug,
  courseId,
  courseTitle,
  isEnrolled,
  isLoading = false,
}: CourseEnrollmentSidebarProps) {
  const { branches: publicBranches } = useBranches();

  const publicBranchNames = useMemo(() => {
    const map = new Map<string, string>();
    publicBranches.forEach((branch) => {
      if (isActiveBranchStatus(branch.status)) {
        map.set(branch.id, branch.branchName);
      }
    });
    return map;
  }, [publicBranches]);

  const options = useMemo(
    () => buildTimingOptions(batches, courseBranches, publicBranchNames),
    [batches, courseBranches, publicBranchNames],
  );

  const batchById = useMemo(() => {
    const map = new Map<string, Batch>();
    batches.forEach((batch) => map.set(batch.id, batch));
    return map;
  }, [batches]);

  const availableModes = useMemo(
    () =>
      COURSE_MODE_ORDER.filter((mode) => options.some((o) => o.mode === mode)),
    [options],
  );

  const [selectedMode, setSelectedMode] = useState<BatchMode | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedTimingKey, setSelectedTimingKey] = useState<string>("");

  useEffect(() => {
    if (availableModes.length === 0) {
      setSelectedMode(null);
      return;
    }

    setSelectedMode((current) =>
      current && availableModes.includes(current)
        ? current
        : availableModes[0],
    );
  }, [availableModes]);

  const modeOptions = useMemo(
    () =>
      selectedMode
        ? options.filter((option) => option.mode === selectedMode)
        : [],
    [options, selectedMode],
  );

  const branchChoices = useMemo(() => {
    const branchIds = uniqueBranchIds(modeOptions);

    return branchIds
      .map((branchId) => {
        if (publicBranches.length > 0) {
          const publicBranch = publicBranches.find(
            (branch) => branch.id === branchId,
          );
          if (publicBranch && !isActiveBranchStatus(publicBranch.status)) {
            return null;
          }
        }

        const name = (
          publicBranchNames.get(branchId) ||
          courseBranches.find((branch) => branch.id === branchId)?.branchName ||
          modeOptions.find((option) => option.branchId === branchId)
            ?.branchName ||
          ""
        ).trim();

        if (!name) {
          return null;
        }

        return { id: branchId, name };
      })
      .filter((branch): branch is { id: string; name: string } => Boolean(branch))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [modeOptions, publicBranchNames, courseBranches, publicBranches]);

  useEffect(() => {
    setSelectedBranchId((current) => {
      if (current && branchChoices.some((branch) => branch.id === current)) {
        return current;
      }

      return branchChoices[0]?.id ?? "";
    });
    setSelectedTimingKey("");
  }, [selectedMode, branchChoices]);

  const timingChoices = useMemo(() => {
    if (!selectedBranchId) {
      return [];
    }

    return modeOptions
      .filter((option) => option.branchId === selectedBranchId)
      .sort((a, b) => a.startDateIso.localeCompare(b.startDateIso));
  }, [modeOptions, selectedBranchId]);

  useEffect(() => {
    setSelectedTimingKey((current) =>
      current && timingChoices.some((timing) => timing.key === current)
        ? current
        : "",
    );
  }, [timingChoices]);

  const selectedOption =
    timingChoices.find((timing) => timing.key === selectedTimingKey) ?? null;

  const selectedBatch = selectedOption
    ? batchById.get(selectedOption.batchId)
    : undefined;

  const displayPricing: BatchPricing | null = (() => {
    if (selectedOption && selectedBatch) {
      return resolveModePricing(selectedBatch, selectedOption.mode);
    }

    if (selectedMode && timingChoices[0]) {
      const previewBatch = batchById.get(timingChoices[0].batchId);
      return previewBatch
        ? resolveModePricing(previewBatch, selectedMode)
        : null;
    }

    if (selectedMode && modeOptions[0]) {
      const previewBatch = batchById.get(modeOptions[0].batchId);
      return previewBatch
        ? resolveModePricing(previewBatch, selectedMode)
        : null;
    }

    return null;
  })();

  const showDiscount = displayPricing
    ? hasBatchDiscount(displayPricing)
    : false;
  const savingsAmount =
    displayPricing && showDiscount
      ? Math.max(
          0,
          displayPricing.originalPrice - displayPricing.discountedPrice,
        )
      : 0;

  const enrollHref =
    selectedOption?.joinEnabled && selectedOption.timingId
      ? getCourseEnrollPath(
          { slug: courseSlug },
          {
            batchId: selectedOption.batchId,
            branchId: selectedOption.branchId,
            courseId,
            batchTimingId: selectedOption.timingId,
            mode: selectedOption.mode,
          },
        )
      : null;

  const whatsappUrl = buildWhatsAppUrl(courseTitle);

  const handleModeChange = (mode: BatchMode) => {
    setSelectedMode(mode);
    setSelectedBranchId("");
    setSelectedTimingKey("");
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    setSelectedTimingKey("");
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(11,31,58,0.35)]">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="mt-3 h-10 w-full rounded-xl" />
        <Skeleton className="mt-5 h-3 w-28" />
        <Skeleton className="mt-2 h-8 w-28" />
        <Skeleton className="mt-5 h-11 w-full rounded-xl" />
        <Skeleton className="mt-3 h-24 w-full rounded-xl" />
        <Skeleton className="mt-5 h-11 w-full rounded-xl" />
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(11,31,58,0.35)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563D9]">
          Your enrollment
        </p>
        <p className="mt-2 text-sm font-semibold text-[#0B1F3A]">
          You are already enrolled in this course.
        </p>
        <Link href={`/student/courses/${courseId}`} className="mt-5 block">
          <Button
            type="button"
            className="h-11 w-full rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] text-sm font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
          >
            Continue Learning
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  if (options.length === 0 || !selectedMode) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563D9]">
          Enrollment
        </p>
        <p className="mt-2 text-sm font-semibold text-[#0B1F3A]">
          No upcoming batches yet
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Batch schedules and fees will appear here when they are published.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#F0FFF6] text-sm font-semibold text-[#128C7E] transition hover:bg-[#E7F9EF]"
        >
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_-24px_rgba(11,31,58,0.35)]">
      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Select Learning Mode
        </p>
        <div
          className={cn(
            "mt-2.5 grid gap-1 rounded-xl bg-slate-100 p-1",
            availableModes.length === 1 && "grid-cols-1",
            availableModes.length === 2 && "grid-cols-2",
            availableModes.length >= 3 && "grid-cols-3",
          )}
        >
          {availableModes.map((mode) => {
            const active = selectedMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeChange(mode)}
                className={cn(
                  "rounded-lg px-2 py-2 text-center text-[11px] font-semibold transition",
                  active
                    ? "bg-white text-[#0B1F3A] shadow-sm"
                    : "text-slate-500 hover:text-[#0B1F3A]",
                )}
              >
                {MODE_SEGMENT_LABELS[mode]}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Standard Pricing
          </p>

          {displayPricing?.isFree ? (
            <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
              Free
            </p>
          ) : displayPricing ? (
            <div className="mt-2">
              {showDiscount ? (
                <p className="text-sm text-slate-400 line-through">
                  {formatBatchPrice({
                    ...displayPricing,
                    discountedPrice: displayPricing.originalPrice,
                  })}
                </p>
              ) : null}
              <p className="text-3xl font-bold tracking-tight text-[#0B1F3A]">
                {formatBatchPrice(displayPricing)}
              </p>
              {showDiscount && savingsAmount > 0 ? (
                <p className="mt-1.5 text-sm font-medium text-emerald-600">
                  Save {formatCurrency(savingsAmount, displayPricing.currency)}
                </p>
              ) : null}
              {!selectedOption ? (
                <p className="mt-1 text-xs text-slate-400">
                  Select a timing to confirm the exact fee
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Select a branch and timing to view pricing
            </p>
          )}
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Preferred Branch
          </p>

          {branchChoices.length === 0 ? (
            <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-3.5">
              <p className="text-sm font-medium text-[#0B1F3A]">
                No active branches available
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                No active branch currently offers this learning mode for the
                course.
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <AppSelect
                value={selectedBranchId}
                options={branchChoices.map((branch) => ({
                  value: branch.id,
                  label: branch.name,
                }))}
                onValueChange={handleBranchChange}
              />
            </div>
          )}
        </div>

        {selectedBranchId ? (
          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Available Batch Timings
            </p>

            {timingChoices.length === 0 ? (
              <p className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                No upcoming timings for this branch and learning mode.
              </p>
            ) : (
              <div
                className="mt-2 max-h-72 space-y-2 overflow-y-auto pr-0.5"
                role="radiogroup"
                aria-label="Available batch timings"
              >
                {timingChoices.map((timing) => {
                  const active = selectedTimingKey === timing.key;
                  const batch = batchById.get(timing.batchId);
                  const timingPricing = batch
                    ? resolveModePricing(batch, timing.mode)
                    : null;
                  const radioId = `timing-radio-${timing.key}`;

                  return (
                    <label
                      key={timing.key}
                      htmlFor={radioId}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition",
                        active
                          ? "border-[#2563D9] bg-[#F3F7FF] shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#0B1F3A]">
                          {timing.timingName}
                        </p>
                        <div className="mt-2 space-y-1 text-[11px] leading-4 text-slate-600">
                          <p>
                            <span className="font-medium text-slate-700">
                              Days:{" "}
                            </span>
                            {timing.days}
                          </p>
                          <p>
                            <span className="font-medium text-slate-700">
                              Start:{" "}
                            </span>
                            {timing.startDateLabel}
                          </p>
                          {timing.showTimeRange ? (
                            <p>
                              <span className="font-medium text-slate-700">
                                Time:{" "}
                              </span>
                              {timing.startTimeLabel} – {timing.endTimeLabel}
                            </p>
                          ) : null}
                          {timingPricing ? (
                            <p className="pt-0.5 font-semibold text-[#0B1F3A]">
                              {timingPricing.isFree
                                ? "Free"
                                : formatBatchPrice(timingPricing)}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <input
                        id={radioId}
                        type="radio"
                        name="course-sidebar-timing"
                        value={timing.key}
                        checked={active}
                        onChange={() => setSelectedTimingKey(timing.key)}
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#2563D9]"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {enrollHref && selectedOption?.timingId ? (
          <Link
            href={enrollHref}
            className="mt-5 block"
            onClick={() => {
              if (!selectedOption.timingId) {
                return;
              }

              saveEnrollmentSelection({
                courseId,
                branchId: selectedOption.branchId,
                batchId: selectedOption.batchId,
                batchTimingId: selectedOption.timingId,
                mode: selectedOption.mode,
                timing: {
                  id: selectedOption.timingId,
                  name: selectedOption.timingName,
                  mode: selectedOption.mode,
                  startDate: selectedOption.startDateIso,
                  startTime: selectedOption.startTime,
                  endTime: selectedOption.endTime,
                  daysOfWeek: selectedOption.daysOfWeek,
                },
              });
            }}
          >
            <Button
              type="button"
              className="h-11 w-full rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] text-sm font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
            >
              Buy Course Now
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button
            type="button"
            disabled
            className="mt-5 h-11 w-full rounded-xl bg-slate-100 text-sm font-semibold text-slate-400"
          >
            {selectedBranchId
              ? selectedOption
                ? selectedOption.timingId
                  ? "Unavailable"
                  : "Select a Timing"
                : "Select a Timing"
              : "Select a Branch"}
          </Button>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#25D366]/35 bg-[#F0FFF6] text-sm font-semibold text-[#128C7E] transition hover:bg-[#E7F9EF]"
        >
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>
      </div>

      {PAYMENT_PARTNER_LABELS.length > 0 ? (
        <div className="border-t border-slate-100 bg-[#FAFBFC] px-5 py-3.5">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Secure Payment Partners
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {PAYMENT_PARTNER_LABELS.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
