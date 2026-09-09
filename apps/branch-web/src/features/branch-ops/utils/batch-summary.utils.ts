import type { BatchListItem, BatchSummary } from "@/src/features/branch-ops/types";

import { getBatchAggregateStats } from "./batch-timing.utils";

export function buildBatchSummary(batch: BatchListItem): BatchSummary {
  const aggregate = getBatchAggregateStats(batch);
  const students = batch.students ?? [];

  let attendancePresent = 0;
  let attendanceAbsent = 0;

  for (const student of students) {
    attendancePresent += student.attendance?.present ?? 0;
    attendanceAbsent += student.attendance?.absent ?? 0;
  }

  return {
    batchId: batch.id,
    studentsCount: students.length || aggregate.totalEnrolled,
    trainerCount: batch.trainers?.length ?? 0,
    enrolledCount: aggregate.totalEnrolled,
    capacity: aggregate.totalCapacity,
    attendancePresent,
    attendanceAbsent,
  };
}
