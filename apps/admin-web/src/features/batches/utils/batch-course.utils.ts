import type {
  BatchCourseAssignment,
  BatchTrainer,
} from "@/src/features/batches/types/batch.types";

export const NO_BATCH_COURSES_LABEL = "No courses assigned yet";
export const COURSE_TRAINER_UNASSIGNED_LABEL = "Not yet assigned";

export function getAssignmentCourseTrainers(
  assignment: BatchCourseAssignment,
): BatchTrainer[] {
  if (assignment.trainers?.length) {
    return assignment.trainers;
  }

  return assignment.trainer ? [assignment.trainer] : [];
}

export function formatAssignmentTrainerNames(
  assignment: BatchCourseAssignment,
): string {
  return getAssignmentCourseTrainers(assignment)
    .map((trainer) =>
      [trainer.firstName, trainer.lastName].filter(Boolean).join(" ").trim(),
    )
    .filter(Boolean)
    .join(", ");
}

export function getCourseCategoryName(
  assignment: BatchCourseAssignment,
): string {
  return assignment.course.category?.name?.trim() ?? "";
}

export function getUniqueCategoryNames(
  assignments: BatchCourseAssignment[],
): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const assignment of assignments) {
    const name = getCourseCategoryName(assignment);
    if (!name || seen.has(name)) {
      continue;
    }

    seen.add(name);
    names.push(name);
  }

  return names;
}

export function formatBatchCategoriesFromAssignments(
  assignments: BatchCourseAssignment[],
): string {
  if (assignments.length === 0) {
    return NO_BATCH_COURSES_LABEL;
  }

  const categories = getUniqueCategoryNames(assignments);

  if (categories.length === 0) {
    return NO_BATCH_COURSES_LABEL;
  }

  return categories.join(", ");
}

export function formatAssignedCourseTitles(
  assignments: BatchCourseAssignment[],
): string {
  if (assignments.length === 0) {
    return NO_BATCH_COURSES_LABEL;
  }

  return assignments.map((assignment) => assignment.course.title).join(", ");
}

export function formatAssignedTrainerNames(
  assignments: BatchCourseAssignment[],
): string {
  if (assignments.length === 0) {
    return NO_BATCH_COURSES_LABEL;
  }

  const seen = new Set<string>();
  const names: string[] = [];

  for (const assignment of assignments) {
    for (const trainer of getAssignmentCourseTrainers(assignment)) {
      const name = [trainer.firstName, trainer.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (!name || seen.has(name)) {
        continue;
      }

      seen.add(name);
      names.push(name);
    }
  }

  return names.length > 0 ? names.join(", ") : NO_BATCH_COURSES_LABEL;
}

export function formatDaysRemainingOrExpiredStatus(
  isExpired: boolean,
  isNotStarted: boolean,
  daysRemaining: number | null,
  daysUntilStart: number | null,
): string {
  if (isExpired) {
    return "Expired";
  }

  if (isNotStarted && daysUntilStart !== null) {
    return `Starts in ${daysUntilStart} day${daysUntilStart === 1 ? "" : "s"}`;
  }

  const remaining = daysRemaining ?? 0;
  return `${remaining} day${remaining === 1 ? "" : "s"} remaining`;
}

export function getUniqueAssignedCourses(
  assignments: BatchCourseAssignment[],
): BatchCourseAssignment[] {
  const seen = new Set<string>();
  const unique: BatchCourseAssignment[] = [];

  for (const assignment of assignments) {
    if (seen.has(assignment.courseId)) {
      continue;
    }

    seen.add(assignment.courseId);
    unique.push(assignment);
  }

  return unique;
}

export function getCourseDescription(
  course: BatchCourseAssignment["course"],
): string | null {
  const description =
    course.shortDescription?.trim() ||
    course.tagline?.trim() ||
    course.description?.trim();

  return description || null;
}

export function formatAssignedCoursePrice(
  course: BatchCourseAssignment["course"],
): string {
  if (course.isFree) {
    return "Free";
  }

  const amount = Number(course.discountedPrice ?? course.originalPrice ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: course.currency ?? "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatAssignedCourseQualifications(
  course: BatchCourseAssignment["course"],
): string {
  const qualifications = course.minimumQualifications ?? [];

  if (!qualifications.length) {
    return "Not specified";
  }

  return qualifications
    .map((item) =>
      item
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    )
    .join(", ");
}

export interface BatchOverviewTrainer {
  id: string;
  firstName: string;
  lastName: string | null;
  employeeCode: string | null;
  profileImageUrl?: string | null;
  specialization?: string | null;
  status?: string;
  email?: string | null;
  qualification?: string | null;
}

export function getUniqueBatchTrainers(
  batch: Pick<import("@/src/features/batches/types/batch.types").Batch, "trainers">,
  assignments: BatchCourseAssignment[],
): BatchOverviewTrainer[] {
  const trainers = new Map<string, BatchOverviewTrainer>();

  for (const trainer of batch.trainers ?? []) {
    trainers.set(trainer.id, {
      id: trainer.id,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      employeeCode: trainer.employeeCode,
      profileImageUrl: trainer.profileImageUrl ?? null,
      specialization: trainer.specialization ?? null,
      status: trainer.status ?? "ACTIVE",
      email: trainer.email ?? null,
      qualification: trainer.qualification ?? null,
    });
  }

  for (const assignment of assignments) {
    for (const trainer of getAssignmentCourseTrainers(assignment)) {
      if (trainers.has(trainer.id)) {
        const existing = trainers.get(trainer.id)!;
        trainers.set(trainer.id, {
          ...existing,
          profileImageUrl: existing.profileImageUrl ?? trainer.profileImageUrl ?? null,
          specialization: existing.specialization ?? trainer.specialization ?? null,
          status: existing.status ?? trainer.status,
          email: existing.email ?? trainer.email ?? null,
          qualification: existing.qualification ?? trainer.qualification ?? null,
        });
        continue;
      }

      trainers.set(trainer.id, {
        id: trainer.id,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        employeeCode: trainer.employeeCode,
        profileImageUrl: trainer.profileImageUrl ?? null,
        specialization: trainer.specialization ?? null,
        status: trainer.status,
        email: trainer.email ?? null,
        qualification: trainer.qualification ?? null,
      });
    }
  }

  return Array.from(trainers.values());
}

export function formatTrainerDisplayName(
  trainer: Pick<BatchOverviewTrainer, "firstName" | "lastName">,
): string {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ").trim();
}
