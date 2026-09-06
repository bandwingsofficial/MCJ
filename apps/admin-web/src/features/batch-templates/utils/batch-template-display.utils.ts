import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import {
  formatBatchTime,
} from "@/src/features/batches/utils/batch.helper";
import type { BatchMode, DayOfWeek } from "@/src/features/batches/types/batch.types";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function formatTemplateMode(mode: BatchMode): string {
  return (
    FILTER_BATCH_MODES.find((item) => item.value === mode)?.label ??
    mode
  );
}

export function formatTemplateDays(days: DayOfWeek[]): string {
  if (!days.length) {
    return "Anytime";
  }

  const ordered = DAY_ORDER.filter((day) => days.includes(day));
  if (ordered.length === 1) {
    return DAY_SHORT[ordered[0]!];
  }

  const isContiguous =
    ordered.length > 1 &&
    ordered.every((day, index) => {
      if (index === 0) return true;
      const prev = ordered[index - 1]!;
      return DAY_ORDER.indexOf(day) === DAY_ORDER.indexOf(prev) + 1;
    });

  if (isContiguous) {
    return `${DAY_SHORT[ordered[0]!]}-${DAY_SHORT[ordered[ordered.length - 1]!]}`;
  }

  return ordered.map((day) => DAY_SHORT[day]).join(", ");
}

export function formatTemplateTime(template: Pick<
  BatchTemplate,
  "hasFixedTime" | "startTime" | "endTime"
>): string {
  if (!template.hasFixedTime) {
    return "Self-paced";
  }

  return `${formatBatchTime(template.startTime)} - ${formatBatchTime(template.endTime)}`;
}

export function formatTemplateScheduleSummary(
  template: BatchTemplate,
): string {
  const mode = formatTemplateMode(template.mode);
  if (!template.hasFixedTime) {
    return `${mode} • Anytime • Self-paced`;
  }

  return `${mode} • ${formatTemplateDays(template.daysOfWeek)} • ${formatTemplateTime(template)}`;
}
