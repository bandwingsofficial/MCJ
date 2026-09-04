// src/features/courses/utils/course-display.utils.ts

export { formatCurrency } from "@/src/features/batches/utils/batch-pricing.utils";

export function formatDuration(
  duration: number | null,
  durationType: string | null,
): string {
  if (!duration) {
    return "—";
  }

  const unit = durationType?.toLowerCase() ?? "months";
  return `${duration} ${unit}`;
}

export function formatCourseLevel(level: string | null | undefined): string {
  if (!level) {
    return "—";
  }

  return level.charAt(0) + level.slice(1).toLowerCase();
}

export function formatCourseMode(mode: string | null | undefined): string {
  if (!mode) {
    return "—";
  }

  return mode.charAt(0) + mode.slice(1).toLowerCase();
}

export function getCourseLearningOutcomes(
  modules: Array<{ keySkills?: string[] | null }>,
): string[] {
  const skills = modules.flatMap((module) =>
    Array.isArray(module.keySkills) ? module.keySkills : [],
  );

  return [...new Set(skills.map((skill) => skill.trim()).filter(Boolean))];
}
