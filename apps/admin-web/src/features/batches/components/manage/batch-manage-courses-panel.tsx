"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import type { Batch } from "@/src/features/batches/types/batch.types";

interface Props {
  batch: Batch;
}

export function BatchManageCoursesPanel({ batch }: Props) {
  const course = batch.course;
  const hasCourse = Boolean(batch.courseId && course);

  return (
    <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#102A56]">Course</h2>
          <p className="mt-1 text-sm text-[#647A9B]">
            The course is assigned when you create or edit this batch.
          </p>
        </div>
        <Link
          href={`/batches/${batch.id}/edit`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DCE8F5] bg-white px-3 text-sm font-medium text-[#102A56] hover:bg-[#F8FBFF]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Change course
        </Link>
      </div>

      {!batch.courseId ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
          <p className="text-sm font-medium text-[#102A56]">
            No course assigned — edit this batch to select a course
          </p>
        </div>
      ) : hasCourse ? (
        <dl className="grid min-w-0 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-xs text-slate-500">Title</dt>
            <dd className="mt-0.5 break-words text-sm font-semibold text-[#102A56]">
              {course!.title}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">Code</dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-[#102A56]">
              {course!.code?.trim() || "—"}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">Category</dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-[#102A56]">
              {course!.category?.name?.trim() || "—"}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
          <p className="text-sm font-medium text-[#102A56]">
            Course is assigned, but details are unavailable.
          </p>
          <p className="mt-1 text-sm text-[#647A9B]">
            Edit this batch to review or change the course.
          </p>
        </div>
      )}
    </Card>
  );
}
