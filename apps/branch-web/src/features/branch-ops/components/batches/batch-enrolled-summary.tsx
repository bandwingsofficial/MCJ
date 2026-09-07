"use client";

import type {
  BatchListItem,
  BatchStudentItem,
} from "@/src/features/branch-ops/types";
import { formatCurrency } from "@/src/features/branch-ops/utils/format-currency";

function getTimingModeFee(batch: BatchListItem, mode: string) {
  const pricing = batch.modePricing?.[mode];
  if (!pricing) {
    return null;
  }

  return pricing.discountedPrice > 0
    ? pricing.discountedPrice
    : pricing.originalPrice;
}

function countAdmittedStudentsForTiming(
  students: BatchStudentItem[] | undefined,
  timingId: string,
) {
  return (students ?? []).filter(
    (student) => student.batchTiming?.id === timingId,
  ).length;
}

interface Props {
  batch: BatchListItem;
  students?: BatchStudentItem[];
}

export function BatchEnrolledSummary({ batch, students }: Props) {
  const timings = batch.timings ?? [];

  if (timings.length === 0) {
    return (
      <p className="text-sm text-[#647A9B]">
        No assigned batch timings to summarize.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {timings.map((timing) => {
        const studentCount = countAdmittedStudentsForTiming(
          students,
          timing.id,
        );
        const fee = studentCount > 0 ? getTimingModeFee(batch, timing.mode) : null;

        return (
          <li
            key={timing.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E1EBF5] bg-[#F8FAFD] px-4 py-3 text-sm"
          >
            <span className="font-medium text-[#102A56]">{timing.name}</span>
            <span className="text-[#647A9B]">
              {studentCount} student{studentCount === 1 ? "" : "s"}
              {fee != null ? ` · ${formatCurrency(fee)}` : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
