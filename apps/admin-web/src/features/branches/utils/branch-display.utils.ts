import type {
  CourseDurationType,
  CourseLevel,
} from "@/src/features/courses/types/course.types";
import {
  formatCoursePrice as formatFinalCoursePrice,
  getCoursePricing,
  type CoursePricingSource,
} from "@/src/features/courses/utils/course-pricing.util";

export function formatCourseDuration(
  duration?: number | null,
  durationType?: CourseDurationType | null,
): string {
  if (!duration || !durationType) {
    return "—";
  }

  const unit = durationType.toLowerCase();
  const suffix = duration === 1 ? unit.replace(/s$/, "") : unit;

  return `${duration} ${suffix}`;
}

export function formatCourseLevel(level?: CourseLevel | null): string {
  if (!level) {
    return "—";
  }

  return level.charAt(0) + level.slice(1).toLowerCase();
}

export function formatCoursePrice(
  course: CoursePricingSource,
): string {
  return formatFinalCoursePrice(course);
}

export function formatCourseOriginalPrice(
  course: CoursePricingSource,
): string {
  const pricing = getCoursePricing(course);

  if (pricing.isFree) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: pricing.currency,
    maximumFractionDigits: 2,
  }).format(pricing.originalPrice);
}

export function formatTrainerNames(
  trainers: Array<{
    firstName?: string | null;
    lastName?: string | null;
  }>,
): string {
  if (!trainers.length) {
    return "—";
  }

  return trainers
    .map((trainer) =>
      [trainer.firstName, trainer.lastName].filter(Boolean).join(" "),
    )
    .join(", ");
}

export function formatBatchLabel(
  name?: string | null,
  code?: string | null,
): string {
  if (!name) {
    return "—";
  }

  return code ? `${name} (${code})` : name;
}

export function formatPersonName(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ");

  return name || "—";
}

export function truncateText(value?: string | null, max = 80): string {
  if (!value?.trim()) {
    return "—";
  }

  const trimmed = value.trim();

  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

export function formatBranchAddress(branch: {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
}): string {
  const locality = [branch.city, branch.state].filter(Boolean).join(", ");
  const parts = [
    branch.addressLine1,
    branch.addressLine2,
    locality,
    branch.country,
    branch.postalCode,
  ].filter((part) => Boolean(part?.trim()));

  return parts.join(", ");
}
