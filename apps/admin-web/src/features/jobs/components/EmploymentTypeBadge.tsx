"use client";

import { cn } from "@/src/shared/lib/cn";

import { EMPLOYMENT_TYPES } from "@/src/features/jobs/constants/job.constants";
import type { EmploymentType } from "@/src/features/jobs/types/job.types";

const compactClass =
  "inline-flex items-center rounded-full px-2 py-0 text-[11px] font-semibold leading-5 whitespace-nowrap";

const TYPE_STYLES: Record<EmploymentType, string> = {
  FULL_TIME: "bg-sky-50 text-sky-800",
  PART_TIME: "bg-violet-50 text-violet-800",
  CONTRACT: "bg-amber-50 text-amber-800",
  INTERNSHIP: "bg-teal-50 text-teal-800",
};

function getEmploymentLabel(type: EmploymentType | string): string {
  return (
    EMPLOYMENT_TYPES.find((item) => item.value === type)?.label ??
    String(type).replaceAll("_", " ")
  );
}

interface EmploymentTypeBadgeProps {
  type: EmploymentType | string;
  className?: string;
}

export function EmploymentTypeBadge({
  type,
  className,
}: EmploymentTypeBadgeProps) {
  const style =
    TYPE_STYLES[type as EmploymentType] ?? "bg-slate-100 text-slate-700";

  return (
    <span className={cn(compactClass, style, className)}>
      {getEmploymentLabel(type)}
    </span>
  );
}
