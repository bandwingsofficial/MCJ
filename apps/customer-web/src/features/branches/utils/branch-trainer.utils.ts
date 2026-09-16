import { getCourses } from "@/src/features/courses/services/course.service";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { Trainer } from "@/src/features/trainers/types/trainer.types";

function isActiveTrainer(trainer: Trainer): boolean {
  return trainer.status === "ACTIVE" && !trainer.isDeleted;
}

export async function loadBranchAssignedTrainers(
  branchId: string,
): Promise<Trainer[]> {
  if (!branchId) {
    return [];
  }

  const courses = await getCourses({ branchId });
  const trainerMap = new Map<string, Trainer>();

  await Promise.all(
    courses.map(async (course) => {
      try {
        const courseTrainers = await trainerService.getTrainers({
          courseId: course.id,
          take: 100,
        });
        courseTrainers.filter(isActiveTrainer).forEach((trainer) => {
          trainerMap.set(trainer.id, trainer);
        });
      } catch {
        // Ignore per-course lookup failures.
      }
    }),
  );

  try {
    const branchTrainers = await trainerService.getTrainers({
      branchId,
      take: 100,
    });
    branchTrainers.filter(isActiveTrainer).forEach((trainer) => {
      trainerMap.set(trainer.id, trainer);
    });
  } catch {
    // Ignore branch lookup failure if course trainers resolved.
  }

  return Array.from(trainerMap.values()).sort((left, right) =>
    `${left.firstName} ${left.lastName}`.localeCompare(
      `${right.firstName} ${right.lastName}`,
    ),
  );
}
