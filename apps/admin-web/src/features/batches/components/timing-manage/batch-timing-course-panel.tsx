"use client";

import {
  BatchManageEmptyMessage,
  BatchManageField,
  BatchManageSection,
} from "@/src/features/batches/components/manage/batch-manage-section";
import type {
  Batch,
  BatchTiming,
} from "@/src/features/batches/types/batch.types";
import { formatBatchMode } from "@/src/features/batches/utils/batch.helper";

interface Props {
  batch: Batch;
  timing: BatchTiming;
}

/**
 * The course always comes from the parent batch (Batch → courseId). Timings
 * never hold their own course relationship.
 */
export function BatchTimingCoursePanel({ batch, timing }: Props) {
  const course = batch.course ?? null;

  return (
    <div className="space-y-4">
      <BatchManageSection
        title="Course"
        description="Inherited from the parent batch."
      >
        {!course ? (
          <BatchManageEmptyMessage message="No course assigned to the parent batch." />
        ) : (
          <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BatchManageField label="Course Name" value={course.title} />
            <BatchManageField
              label="Course Code"
              value={course.code?.trim() || "—"}
            />
            <BatchManageField
              label="Category"
              value={
                course.category?.name?.trim() ||
                batch.category?.name?.trim() ||
                "—"
              }
            />
            <BatchManageField
              label="Learning Mode"
              value={formatBatchMode(batch.mode)}
            />
          </dl>
        )}
      </BatchManageSection>

      <BatchManageSection
        title="Hierarchy"
        description="Where this timing sits in the structure."
      >
        <dl className="grid min-w-0 gap-4 sm:grid-cols-3">
          <BatchManageField
            label="Course"
            value={course?.title?.trim() || "—"}
          />
          <BatchManageField label="Batch" value={batch.name} />
          <BatchManageField label="Batch Timing" value={timing.name} />
        </dl>
      </BatchManageSection>
    </div>
  );
}
