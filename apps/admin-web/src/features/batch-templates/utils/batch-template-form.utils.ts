import type { DayOfWeek } from "@/src/features/batches/types/batch.types";
import type { BatchTemplateFormValues } from "@/src/features/batch-templates/schemas/batch-template.schema";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

export const DEFAULT_BATCH_TEMPLATE_FORM_VALUES: BatchTemplateFormValues = {
  name: "",
  mode: "OFFLINE",
  hasFixedTime: true,
  daysOfWeek: [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ],
  startTime: "07:00",
  endTime: "09:00",
  isActive: true,
  capacity: 30,
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

export function normalizeTimeForInput(
  value: string | null | undefined,
  fallback = "07:00",
): string {
  if (!value?.trim()) {
    return fallback;
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return fallback;
  }

  return `${match[1]!.padStart(2, "0")}:${match[2]!}`;
}

function normalizeDaysOfWeek(days: DayOfWeek[] | null | undefined): DayOfWeek[] {
  if (!Array.isArray(days)) {
    return [];
  }

  return DAY_ORDER.filter((day) => days.includes(day));
}

export function mapBatchTemplateToFormValues(
  template: BatchTemplate,
): BatchTemplateFormValues {
  const hasFixedTime = Boolean(template.hasFixedTime);
  const daysOfWeek = normalizeDaysOfWeek(template.daysOfWeek);

  return {
    name: template.name ?? "",
    mode: template.mode,
    hasFixedTime,
    daysOfWeek: hasFixedTime ? daysOfWeek : [],
    startTime: normalizeTimeForInput(template.startTime, "07:00"),
    endTime: normalizeTimeForInput(template.endTime, "09:00"),
    isActive: template.isActive ?? true,
    capacity:
      typeof template.capacity === "number" && template.capacity >= 1
        ? template.capacity
        : DEFAULT_BATCH_TEMPLATE_FORM_VALUES.capacity,
  };
}
