"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type {
  Batch,
  BatchTiming,
} from "@/src/features/batches/types/batch.types";
import {
  batchTimingManageParentHref,
  batchTimingManageBackLabel,
  type BatchManageReturnContext,
} from "@/src/features/batches/utils/batch-manage.routes";
import {
  courseManagePath,
  courseManageTabPath,
} from "@/src/features/courses/utils/course-manage.routes";
import { formatTimingRange } from "@/src/features/batches/utils/batch-timing.utils";

interface Props {
  batch: Batch;
  timing: BatchTiming;
  returnContext: BatchManageReturnContext;
  activeSection?: string;
}

export function BatchTimingManageHeader({
  batch,
  timing,
  returnContext,
  activeSection,
}: Props) {
  const courseName = batch.course?.title?.trim() || "No course assigned";
  const courseCode = batch.course?.code?.trim() || "";
  const courseId =
    returnContext.kind === "course"
      ? returnContext.courseId
      : batch.courseId?.trim() || batch.course?.id || "";
  const parentBatchHref = batchTimingManageParentHref(batch.id, returnContext);
  const backHref = parentBatchHref;
  const backLabel = batchTimingManageBackLabel(returnContext);

  return (
    <div className="space-y-3">
      <Link
        href={backHref}
        className="inline-flex items-center text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {backLabel}
      </Link>

      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-xs"
      >
        {returnContext.kind === "course" && courseId ? (
          <>
            <Link
              href="/courses"
              className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
            >
              Courses
            </Link>
            <ChevronRight
              className="h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
            <Link
              href={courseManagePath(courseId)}
              className="font-medium text-[#647A9B] transition-colors hover:text-[#2563EB]"
            >
              {courseName}
              {courseCode ? ` (${courseCode})` : ""}
            </Link>
            <ChevronRight
              className="h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
            <Link
              href={courseManageTabPath(courseId, "batches")}
              className="font-medium text-[#647A9B] transition-colors hover:text-[#2563EB]"
            >
              Batches
            </Link>
            <ChevronRight
              className="h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
          </>
        ) : (
          <>
            <Link
              href="/batches"
              className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
            >
              Batches
            </Link>
            <ChevronRight
              className="h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
          </>
        )}
        <Link
          href={parentBatchHref}
          className="font-medium text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          {batch.name} ({batch.code})
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-[#102A56]">{timing.name}</span>
        {activeSection ? (
          <>
            <ChevronRight
              className="h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-start gap-2">
              <h1 className="min-w-0 text-xl font-bold tracking-tight text-[#102A56] sm:text-2xl">
                {timing.name}
              </h1>
              <BatchStatusBadge
                status={timing.status}
                isActive={timing.isActive}
                isDeleted={timing.isDeleted}
                startDate={timing.startDate}
                endDate={timing.endDate}
              />
              <BatchModeBadge mode={timing.mode} />
            </div>
            <p className="mt-1 text-sm text-[#647A9B]">
              {batch.name} ({batch.code}) · {formatTimingRange(timing)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
